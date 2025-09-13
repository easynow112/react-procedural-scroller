import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Scroll } from "../types/scroll";
import { Integer } from "../types/number/integer";
import { getItems } from "../lib/items";
import { useScrollHandler } from "./use-scroll-handler";
import { type Dimensions } from "../types/dimensions";
import { useDeferredScrollReset } from "./use-deferred-scroll-reset";
import { RangeScaledSizes } from "../types/range-scaled-sizes";
import { asRangeScaledSizes } from "../validation/range-scaled-sizes";
import {
  asNonNegativeReal,
  isNonNegativeReal,
} from "../validation/number/non-negative-real";
import { asInteger } from "../validation/number/integer";
import {
  ScrollToIndexInput,
  UseProceduralScrollerProps,
  UseProceduralScrollerResult,
} from "../types/hooks/use-procedural-scroller";
import { asDimensions } from "../validation/dimensions";
import { asScroll } from "../validation/scroll";
import { useItemStack } from "./use-item-stack";
import { mergeConsecutiveIntegerArrays } from "../lib/array";
import { UseElementRefMapResult } from "../types/hooks/use-element-ref-map";
import { ProceduralScrollerError } from "../lib/error";
import { getScrollLength, scrollToIndexInputToScroll } from "../lib/scroll";
import { NonNegativeReal } from "../types/number/non-negative-real";

const scrollToIndexDebounceDelay = 100;

export const useProceduralScroller = <
  ContainerType extends HTMLElement,
  ItemType extends HTMLElement,
>({
  getMinItemSize,
  scrollAreaScale = 3,
  paddingAreaScale = {
    start: 1,
    end: 1,
  },
  initialScroll = {
    block: "center",
    index: 0,
  },
  scrollDirection = "vertical",
  minIndex: minIndexInput,
  maxIndex: maxIndexInput,
  initialContainerSize: initialContainerSizeInput,
}: UseProceduralScrollerProps): UseProceduralScrollerResult<
  ContainerType,
  ItemType
> => {
  /*
   * Derived State:
   * `rangeScaledSizes` maps each section of the virtualized scroller (padding, content) to a normalized height/width
   *    value relative to the container's total height/width.
   * `dimensions` selects DOM scroll properties based on scroll direction, abstracting axis-specific access.
   * `minIndex` / `maxIndex` are the optional bounds of items to render.
   * `initialContainerSize` is an optional prop that allows items to render on the first page load
   *    without waiting for the container to mount and be measured.
   */
  const initialContainerSize = useMemo((): NonNegativeReal | null => {
    if (isNonNegativeReal(initialContainerSizeInput as number)) {
      return asNonNegativeReal(initialContainerSizeInput as number);
    }
    return null;
  }, [initialContainerSizeInput]);
  const minIndex = useMemo((): Integer | null => {
    if (typeof minIndexInput === "number") {
      if (typeof maxIndexInput === "number" && minIndexInput > maxIndexInput) {
        throw new ProceduralScrollerError(
          "minIndex should not be greater than maxIndex",
          { minIndexInput, maxIndexInput },
        );
      }
      return asInteger(minIndexInput);
    }
    return null;
  }, [minIndexInput, maxIndexInput]);
  const maxIndex = useMemo((): Integer | null => {
    if (typeof maxIndexInput === "number") {
      if (typeof minIndexInput === "number" && minIndexInput > maxIndexInput) {
        throw new ProceduralScrollerError(
          "minIndex should not be greater than maxIndex",
          { minIndexInput, maxIndexInput },
        );
      }
      return asInteger(maxIndexInput);
    }
    return null;
  }, [minIndexInput, maxIndexInput]);
  const rangeScaledSizes = useMemo((): RangeScaledSizes => {
    return asRangeScaledSizes({
      startPadding: asNonNegativeReal(paddingAreaScale.start),
      startContent: asNonNegativeReal((scrollAreaScale - 1) / 2),
      content: asNonNegativeReal(1),
      endContent: asNonNegativeReal((scrollAreaScale - 1) / 2),
      endPadding: asNonNegativeReal(paddingAreaScale.end),
    });
  }, [scrollAreaScale, paddingAreaScale]);
  const dimensions: Dimensions = useMemo(() => {
    if (scrollDirection === "horizontal") {
      return asDimensions({
        containerAxis: "clientWidth",
        scrollLength: "scrollLeft",
        itemOffset: "offsetLeft",
      });
    } else if (scrollDirection === "vertical") {
      return asDimensions({
        containerAxis: "clientHeight",
        scrollLength: "scrollTop",
        itemOffset: "offsetTop",
      });
    } else {
      throw new ProceduralScrollerError("Invalid scrollDirection", {
        scrollDirection,
      });
    }
  }, [scrollDirection]);

  /*
   * Refs:
   * `scroll` stores scroll alignment and index to preserve visible position during list updates.
   * `scrollResetting` is used to suppress scroll handlers whilst a list update is in progress.
   * `containerRef` references the container DOM element.
   * `scrollToIndexDebounceRef` stores the timeout ID used to detect the end of smooth-scroll animations: when no
   *    scroll event occurs for `scrollToIndexDebounceDelay`ms, the animation is considered complete.
   */
  const scroll = useRef<Scroll>(
    asScroll({
      ...initialScroll,
      index: asInteger(initialScroll.index),
    }),
  );
  const scrollResetting = useRef<boolean>(true);
  const containerRef = useRef<ContainerType>(null);
  const scrollToIndexDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const scrollToIndexInProgressRef = useRef<boolean>(false);

  /*
   * State:
   *
   * Two item stacks (`itemStackA` and `itemStackB`) are used for double buffering:
   * - One stack stores the currently displayed items in the container.
   * - The other stack stores items for a pending scrollToIndex animation, allowing
   *   the container to jump between stacks without rendering all intermediate items.
   *
   * `itemStackPointer` (0 or 1) indicates which stack is currently active for display.
   *
   * `items` / `setItems` / `getPrimaryRef` refer to the active stack.
   * `secondaryItems` / `setSecondaryItems` / `getSecondaryRef` refer to the inactive stack.
   *
   * `mergedIndexes` is the array of item indexes returned by the hook for the library consumer
   *    to render DOM elements. It combines the indexes from both stacks into a single list
   */
  const [scrollToIndexInput, setScrollToIndexInput] =
    useState<ScrollToIndexInput | null>(null);
  const [itemStackPointer, setItemStackPointer] = useState<0 | 1>(0);
  const itemStackA = useItemStack<ContainerType, ItemType>({
    dimensions,
    rangeScaledSizes,
    containerRef,
    scroll: [scroll.current, scrollToIndexInputToScroll(scrollToIndexInput)][
      itemStackPointer
    ],
    getMinItemSize,
    minIndex,
    maxIndex,
    initialContainerSize,
  });
  const itemStackB = useItemStack<ContainerType, ItemType>({
    dimensions,
    rangeScaledSizes,
    containerRef,
    scroll: [scroll.current, scrollToIndexInputToScroll(scrollToIndexInput)][
      Number(!itemStackPointer)
    ],
    getMinItemSize,
    minIndex,
    maxIndex,
    initialContainerSize,
  });
  const itemStacks = useMemo(
    () => [itemStackA, itemStackB],
    [itemStackA, itemStackB],
  );
  const items = useMemo(
    () => itemStacks[itemStackPointer].items,
    [itemStackPointer, itemStacks],
  );
  const setItems = useMemo(
    () => itemStacks[itemStackPointer].setItems,
    [itemStackPointer, itemStacks],
  );
  const getPrimaryRef = useMemo(
    () => itemStacks[itemStackPointer].getRef,
    [itemStackPointer, itemStacks],
  );
  const secondaryItems = useMemo(
    () => itemStacks[Number(!itemStackPointer)].items,
    [itemStackPointer, itemStacks],
  );
  const setSecondaryItems = useMemo(
    () => itemStacks[Number(!itemStackPointer)].setItems,
    [itemStackPointer, itemStacks],
  );
  const getSecondaryRef = useMemo(
    () => itemStacks[Number(!itemStackPointer)].getRef,
    [itemStackPointer, itemStacks],
  );
  const mergedIndexes = useMemo((): Integer[] => {
    return mergeConsecutiveIntegerArrays(
      items?.indexes || [],
      secondaryItems?.indexes || [],
    );
  }, [items, secondaryItems]);

  /*
   * Item ref accessors:
   *
   * `getRef` returns the element ref for a given index from either item stack.
   * `getRefOrError` behaves like `getRef` but throws an error if no ref is found.
   */
  const getRef: UseElementRefMapResult<ItemType>["getRef"] = useCallback(
    (index) => {
      const primaryRef = getPrimaryRef(index);
      const secondaryRef = getSecondaryRef(index);
      if (primaryRef?.current) {
        return primaryRef;
      }
      if (secondaryRef?.current) {
        return secondaryRef;
      }
      return primaryRef || secondaryRef;
    },
    [getPrimaryRef, getSecondaryRef],
  );
  const getRefOrError: UseElementRefMapResult<ItemType>["getRefOrError"] =
    useCallback(
      <RequireNonNull extends boolean>(
        index: string | number,
        requireNonNull: RequireNonNull,
      ) => {
        const ref = getRef(index);
        if (ref && !requireNonNull) {
          return ref as RequireNonNull extends true
            ? RefObject<ItemType>
            : RefObject<ItemType | null>;
        }
        if (ref?.current !== null && requireNonNull) {
          return ref as RequireNonNull extends true
            ? RefObject<ItemType>
            : RefObject<ItemType | null>;
        }
        throw new ProceduralScrollerError("Could not find ref", {
          index,
          ref,
          requireNonNull,
        });
      },
      [getRef],
    );

  /*
   * `updateItems` recalculates the active items in the container based on the updated scroll position,
   *    It also adjusts the container's scroll offset, creating an illusion of continuous scrolling.
   */
  const updateItems = useCallback(
    (newScroll: Scroll, container: ContainerType) => {
      scroll.current = { ...newScroll };
      scrollResetting.current = true;
      setItems(
        getItems(
          asNonNegativeReal(container[dimensions.containerAxis]),
          rangeScaledSizes,
          newScroll,
          getMinItemSize,
          minIndex,
          maxIndex,
        ),
      );
    },
    [
      setItems,
      dimensions.containerAxis,
      rangeScaledSizes,
      getMinItemSize,
      minIndex,
      maxIndex,
    ],
  );

  /*
   * `completeScrollToIndex` finalizes a `scrollToIndex` operation by swapping the active item stacks
   *    while keeping the container scroll consistent.
   */
  const completeScrollToIndex = useCallback(() => {
    scrollToIndexDebounceRef.current = null;
    const container = containerRef.current;
    if (!container) {
      throw new ProceduralScrollerError("The container could not be found", {
        container,
      });
    }
    if (!scrollToIndexInput) {
      throw new ProceduralScrollerError(
        "A scrollToIndex process could not be found",
        { scrollToIndexInput },
      );
    }
    scrollResetting.current = true;
    scrollToIndexInProgressRef.current = false;
    setItemStackPointer((prev) => {
      itemStacks[Number(prev)].setItems(null);
      return Number(!prev) as 0 | 1;
    });
    setScrollToIndexInput(null);
  }, [itemStacks, scrollToIndexInput]);

  /*
   * Container onScroll logic:
   *
   * If the scroll position moves outside the 'contentItem' range, this triggers
   * a scroll reset to realign the viewport and re-render items, creating an illusion
   * of continuous scrolling.
   */
  const containerScrollHandler = useCallback(
    (container: ContainerType, ev: Event, isRetry: boolean = false): void => {
      if (secondaryItems) {
        if (typeof scrollToIndexDebounceRef.current === "number")
          clearTimeout(scrollToIndexDebounceRef.current);
        scrollToIndexDebounceRef.current = setTimeout(
          completeScrollToIndex,
          scrollToIndexDebounceDelay,
        );
        return;
      }
      if (scrollResetting.current || !items) return;
      const startContentIndex = items.rangePointers["startContent"][0];
      const endContentIndex = items.rangePointers["endContent"][1];
      const startContentItem = getRef(
        items.indexes[startContentIndex],
      )?.current;
      const endContentItem = getRef(items.indexes[endContentIndex])?.current;
      if (!startContentItem || !endContentItem) {
        if (!isRetry) {
          requestAnimationFrame(() =>
            containerScrollHandler(container, ev, true),
          );
        }
        return;
      }
      if (
        (typeof minIndex !== "number" || mergedIndexes[0] > minIndex) &&
        container[dimensions.scrollLength] <
          startContentItem[dimensions.itemOffset]
      ) {
        updateItems(
          {
            block: "start",
            index: items.indexes[startContentIndex],
          },
          container,
        );
      } else if (
        (typeof maxIndex !== "number" ||
          mergedIndexes[mergedIndexes.length - 1] < maxIndex) &&
        container[dimensions.scrollLength] +
          container[dimensions.containerAxis] >
          endContentItem[dimensions.itemOffset] +
            endContentItem[dimensions.containerAxis]
      ) {
        updateItems(
          {
            block: "end",
            index: items.indexes[endContentIndex],
          },
          container,
        );
      }
    },
    [
      secondaryItems,
      items,
      getRef,
      minIndex,
      mergedIndexes,
      dimensions.scrollLength,
      dimensions.itemOffset,
      dimensions.containerAxis,
      maxIndex,
      completeScrollToIndex,
      updateItems,
    ],
  );
  useScrollHandler({
    elementRef: containerRef,
    handler: containerScrollHandler,
  });

  /*
   * On every update to the `items` list, this hook resets the scroll position to maintain
   * the expected viewport alignment using the latest scroll reference.
   */
  useDeferredScrollReset({
    scroll,
    onScrollReset: () => {
      scrollResetting.current = false;
    },
    containerRef,
    items,
    getRef,
    dimensions,
    suppress: scrollToIndexInProgressRef.current,
  });

  /*
   * External API for manually scrolling to a specific item by index and alignment.
   * The scrollToIndex function works as follows:
   * 1.) The secondary item stack is updated to contain the target items.
   * 2.) Following this state update, the browser 'scrollTo' api is used to scroll the container to the target position.
   * 3.) The `completeScrollToIndex` function is called to finalise the scroll and swap the item stacks such that the
   *   one containing the target items is now the primary.
   */
  const scrollToIndex = useCallback(
    (input: ScrollToIndexInput) => {
      const container = containerRef?.current;
      if (!container) {
        throw new ProceduralScrollerError("Could not find container", {
          container,
        });
      }
      let targetIndex: Integer = asInteger(input.index);
      if (typeof minIndex === "number") {
        targetIndex = asInteger(Math.max(targetIndex, minIndex));
      }
      if (typeof maxIndex === "number") {
        targetIndex = asInteger(Math.min(targetIndex, maxIndex));
      }
      const targetScroll = asScroll({
        block: input.block,
        index: targetIndex,
      });
      scroll.current = targetScroll;
      scrollResetting.current = true;
      scrollToIndexInProgressRef.current = true;
      setScrollToIndexInput({
        ...input,
        ...targetScroll,
      });
      setSecondaryItems(
        getItems(
          asNonNegativeReal(container[dimensions.containerAxis]),
          rangeScaledSizes,
          targetScroll,
          getMinItemSize,
          minIndex,
          maxIndex,
        ),
      );
    },
    [
      dimensions.containerAxis,
      getMinItemSize,
      maxIndex,
      minIndex,
      rangeScaledSizes,
      setSecondaryItems,
    ],
  );

  /*
   * This effect runs immediately after `scrollToIndex` updates `secondaryItems`.
   * Its role is to carry out the actual DOM-level scroll:
   */
  useEffect(() => {
    if (!secondaryItems || !scrollToIndexInput) return;
    const itemRef = getRefOrError(scrollToIndexInput.index, true);
    const item = itemRef.current;
    const container = containerRef?.current;
    if (!item || !container) {
      throw new ProceduralScrollerError(
        `Tried to scroll to index = ${scrollToIndexInput.index} but the element/container has no mounted ref`,
        { container, item },
      );
    }
    const scrollPos = getScrollLength(
      scrollToIndexInput.block,
      container[dimensions.containerAxis],
      item[dimensions.containerAxis],
      item[dimensions.itemOffset],
    );
    container.scrollTo({
      behavior: scrollToIndexInput.behavior || "auto",
      [dimensions.containerAxis === "clientWidth" ? "left" : "top"]: scrollPos,
    });
    scrollToIndexDebounceRef.current = setTimeout(
      completeScrollToIndex,
      scrollToIndexDebounceDelay,
    );
  }, [
    getRefOrError,
    secondaryItems,
    scrollToIndexInput,
    dimensions,
    maxIndex,
    minIndex,
    completeScrollToIndex,
  ]);

  /*
   * Hook return value:
   */
  if (items) {
    return {
      scrollToIndex,
      container: {
        ref: containerRef,
      },
      items: mergedIndexes.map((index: number) => {
        return {
          index,
          ref: getRefOrError(index, false),
        };
      }),
    };
  } else {
    return {
      scrollToIndex,
      container: {
        ref: containerRef,
      },
      items: null,
    };
  }
};
