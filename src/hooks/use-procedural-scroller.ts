import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Scroll } from "../types/scroll";
import { Integer } from "../types/number/integer";
import { getItems } from "../lib/items";
import { useScrollHandler } from "./use-scroll-handler";
import { type Dimensions } from "../types/dimensions";
import { useDeferredScrollReset } from "./use-deferred-scroll-reset";
import { RangeScaledSizes } from "../types/range-scaled-sizes";
import { asRangeScaledSizes } from "../validation/range-scaled-sizes";
import { asNonNegativeReal } from "../validation/number/non-negative-real";
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
}: UseProceduralScrollerProps): UseProceduralScrollerResult<
  ContainerType,
  ItemType
> => {
  /*
   * Derived State:
   *
   * `rangeScaledSizes` maps each section of the virtualized scroller (padding, content)
   *  to a normalized size (height/width) value relative to the container's total size (height/width).
   *
   * `dimensions` selects DOM scroll properties based on scroll direction, abstracting axis-specific access.
   */
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
   */
  const scroll = useRef<Scroll>(
    asScroll({
      ...initialScroll,
      index: asInteger(initialScroll.index),
    }),
  );
  const scrollResetting = useRef<boolean>(true);
  const containerRef = useRef<ContainerType>(null);
  const scrollToIndexDebounceRef = useRef<number | null>(null);

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
      (index) => {
        const ref = getRef(index);
        if (ref) {
          return ref;
        }
        throw new ProceduralScrollerError("Could not find ref", { index, ref });
      },
      [getRef],
    );

  /*
   * Helper to update `items` state while preserving scroll position:
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
    scroll.current = {
      block: scrollToIndexInput.block,
      index: asInteger(scrollToIndexInput.index),
    };
    scrollResetting.current = true;
    setItems(null); // Since we also update itemStackPointer this actually sets secondaryItems
    setItemStackPointer((prev) => Number(!prev) as 0 | 1);
    setScrollToIndexInput(null);
  }, [scrollToIndexInput, setItems]);

  const mergedIndexes = useMemo((): Integer[] => {
    return mergeConsecutiveIntegerArrays(
      items?.indexes || [],
      secondaryItems?.indexes || [],
    );
  }, [items, secondaryItems]);

  /*
   * Container onScroll logic:
   *
   * If the scroll position moves outside the current content range, this triggers
   * a scroll reset to realign the viewport and re-render items, creating an illusion
   * of continuous scrolling.
   */
  const containerScrollHandler = useCallback(
    (container: ContainerType): void => {
      if (secondaryItems) {
        if (typeof scrollToIndexDebounceRef.current === "number")
          clearTimeout(scrollToIndexDebounceRef.current);
        scrollToIndexDebounceRef.current = setTimeout(
          completeScrollToIndex,
          100,
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
        throw new ProceduralScrollerError(`Could not find contentItem`, {
          startContentIndex,
          startContentItem,
          endContentIndex,
          endContentItem,
        });
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
  });

  /*
   * External API for manually scrolling to a specific item by index and alignment.
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
      scrollResetting.current = true;
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

  useEffect(() => {
    if (!secondaryItems || !scrollToIndexInput) return;
    const itemRef = getRefOrError(scrollToIndexInput.index);
    const item = itemRef.current;
    const container = containerRef?.current;
    if (!item || !container) {
      throw new ProceduralScrollerError(
        `Tried to scroll to index = ${scrollToIndexInput.index} but the element/container has no mounted ref`,
        { container, item },
      );
    }
    requestAnimationFrame(() => {
      const scrollPos = getScrollLength(
        scrollToIndexInput.block,
        container[dimensions.containerAxis],
        item[dimensions.containerAxis],
        item[dimensions.itemOffset],
      );
      container.scrollTo({
        behavior: scrollToIndexInput.behavior || "auto",
        [dimensions.containerAxis === "clientWidth" ? "left" : "top"]:
          scrollPos,
      });
    });
  }, [
    getRefOrError,
    secondaryItems,
    scrollToIndexInput,
    dimensions,
    maxIndex,
    minIndex,
  ]);

  /*
   * Result:
   */
  if (items) {
    return {
      scrollToIndex,
      container: {
        ref: containerRef,
      },
      rows: mergedIndexes.map((index: number) => {
        return {
          index,
          ref: getRefOrError(index),
        };
      }),
    };
  } else {
    return {
      scrollToIndex,
      container: {
        ref: containerRef,
      },
      rows: null,
    };
  }
};
