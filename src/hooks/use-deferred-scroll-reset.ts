import { useCallback, useLayoutEffect } from "react";
import { Scroll } from "../types/scroll";
import { UseDeferredScrollResetProps } from "../types/hooks/use-deferred-scroll-reset";
import { ProceduralScrollerError } from "../lib/error";
import { getScrollLength } from "../lib/scroll";

export function useDeferredScrollReset<
  ContainerType extends HTMLElement,
  ItemType extends HTMLElement,
>({
  scroll,
  onScrollReset,
  containerRef,
  items,
  getRef,
  dimensions,
}: UseDeferredScrollResetProps<ContainerType, ItemType>): void {
  /*
   * Scrolls the container to the specified item with the desired alignment.
   */
  const scrollTo = useCallback(
    (scroll: Scroll) => {
      const item = getRef(scroll.index)?.current;
      const container = containerRef.current;
      if (!item || !container) {
        if (items) {
          throw new ProceduralScrollerError(
            `Could not execute scrollTo, ${!container ? "container" : "item"} ref is ${!container ? container : item}`,
            {
              item,
              container,
              scroll,
              items,
            },
          );
        } else {
          return;
        }
      }
      container[dimensions.scrollLength] = getScrollLength(
        scroll.block,
        container[dimensions.containerAxis],
        item[dimensions.containerAxis],
        item[dimensions.itemOffset],
      );
      onScrollReset();
    },
    [
      containerRef,
      dimensions.containerAxis,
      dimensions.itemOffset,
      dimensions.scrollLength,
      getRef,
      items,
      onScrollReset,
    ],
  );

  /*
   * On every update to the `items` list, resets the scroll position to maintain
   * the expected viewport alignment using the latest scroll reference.
   * Uses `requestAnimationFrame` to defer the scroll adjustment until after the DOM updates.
   */
  useLayoutEffect(() => {
    if (!scroll?.current) return;
    const scrollReference = { ...scroll.current };
    requestAnimationFrame(() => {
      if (scrollReference) {
        scrollTo(scrollReference);
      }
    });
  }, [scroll, scrollTo, items]);
}
