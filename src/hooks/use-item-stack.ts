import {
  UseItemStackProps,
  UseItemStackResult,
} from "../types/hooks/use-item-stack";
import { createRef, useCallback, useState } from "react";
import { Items } from "../types/items";
import { getItems, itemsAreEqual } from "../lib/items";
import { asNonNegativeReal } from "../validation/number/non-negative-real";
import { useElementRefMap } from "./use-element-ref-map";
import { asPositiveInteger } from "../validation/number/positive-integer";
import { useDimensionObserver } from "./use-dimension-observer";
import { getElementSize } from "../lib/dimensions";
import { NonNegativeReal } from "../types/number/non-negative-real";

export function useItemStack<
  ContainerType extends HTMLElement,
  ItemType extends HTMLElement,
>({
  scrollDirection,
  rangeScaledSizes,
  containerRef,
  scroll,
  getMinItemSize,
  minIndex,
  maxIndex,
  initialContainerSize,
}: UseItemStackProps<ContainerType>): UseItemStackResult<ItemType> {
  /*
   * State:
   * `items` contains the array of indexes to be rendered.
   */
  const [items, setItems] = useState<Items | null>(() => {
    const container = containerRef?.current;
    let containerSize: NonNegativeReal | null =
      typeof initialContainerSize === "number"
        ? asNonNegativeReal(initialContainerSize)
        : null;
    if (container) {
      containerSize = asNonNegativeReal(
        getElementSize(container, scrollDirection, {
          includePadding: false,
          includeBorder: false,
          includeMargin: false,
        }),
      );
    }
    return scroll && typeof containerSize === "number"
      ? getItems(
          containerSize,
          rangeScaledSizes,
          scroll,
          getMinItemSize,
          minIndex,
          maxIndex,
        )
      : null;
  });

  /*
   * Item Refs:
   * Initializes a ref for each index to be rendered
   */
  const { getRef, setRef, getRefOrError } = useElementRefMap<ItemType>({
    cacheLimit: asPositiveInteger(
      typeof items?.indexes?.length === "number" ? items.indexes.length * 2 : 1,
    ),
  });
  if (items?.indexes) {
    items.indexes.forEach((index) => {
      setRef(index, getRef(index) || createRef<ItemType>());
    });
  }

  /*
   * Container resize logic:
   * `containerResizeHandler` Should only run when the observed dimension of the container changes
   */
  const containerResizeHandler = useCallback(
    (container: ContainerType) => {
      if (!scroll) {
        return;
      }
      setItems((prevItems) => {
        const newItems = getItems(
          asNonNegativeReal(
            getElementSize(container, scrollDirection, {
              includePadding: false,
              includeBorder: false,
              includeMargin: false,
            }),
          ),
          rangeScaledSizes,
          scroll,
          getMinItemSize,
          minIndex,
          maxIndex,
        );
        return prevItems !== null && itemsAreEqual(newItems, prevItems)
          ? prevItems
          : newItems;
      });
    },
    [
      scroll,
      scrollDirection,
      rangeScaledSizes,
      getMinItemSize,
      minIndex,
      maxIndex,
    ],
  );
  useDimensionObserver({
    dimensions: [
      scrollDirection === "horizontal" ? "clientWidth" : "clientHeight",
    ],
    elementRef: containerRef,
    resizeHandler: containerResizeHandler,
  });

  return {
    items,
    setItems,
    getRef,
    getRefOrError,
  };
}
