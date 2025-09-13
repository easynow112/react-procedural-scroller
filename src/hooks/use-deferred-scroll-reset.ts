import { useCallback, useLayoutEffect } from "react";
import { Scroll } from "../types/scroll";
import { UseDeferredScrollResetProps } from "../types/hooks/use-deferred-scroll-reset";
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
  suppress,
}: UseDeferredScrollResetProps<ContainerType, ItemType>): void {
  /*
   * Scrolls the container to the specified item with the desired alignment.
   */
  const scrollTo = useCallback(
    (scroll: Scroll, retry: boolean = false) => {
      const item = getRef(scroll.index)?.current;
      const container = containerRef.current;
      if (!item || !container) {
        if (!retry) {
          requestAnimationFrame(() => {
            scrollTo(scroll, true);
          });
        }
        return;
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
      onScrollReset,
    ],
  );

  /*
   * On every update to the `items` list, resets the scroll position to maintain
   * the expected viewport alignment using the latest scroll reference.
   * Uses `requestAnimationFrame` to defer the scroll adjustment until after the DOM updates.
   */
  useLayoutEffect(() => {
    if (suppress) return;
    if (!scroll?.current) return;
    const scrollReference = { ...scroll.current };
    requestAnimationFrame(() => {
      if (scrollReference) {
        scrollTo(scrollReference);
      }
    });
  }, [scroll, scrollTo, items, suppress]);
}
