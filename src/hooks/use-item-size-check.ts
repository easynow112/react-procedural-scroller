import { UseItemSizeCheckProps } from "../types/hooks/use-item-size-check";
import { useEffect } from "react";
import { getElementSize } from "../lib/dimensions";
import { ProceduralScrollerError } from "../lib/error";

export function useItemSizeCheck<
  ContainerType extends HTMLElement,
  ItemType extends HTMLElement,
>({
  items,
  getMinItemSize,
  scrollDirection,
  enabled,
}: UseItemSizeCheckProps<ContainerType, ItemType>) {
  useEffect(() => {
    if (!items || !enabled) {
      return;
    }
    items.forEach((itemObj) => {
      const item = itemObj?.ref?.current;
      if (!item) {
        return;
      }
      const itemSize = getElementSize(item, scrollDirection, {
        includePadding: true,
        includeBorder: true,
        includeMargin: true,
      });
      const expectedMinimum = getMinItemSize(itemObj.index);
      if (expectedMinimum > itemSize) {
        throw new ProceduralScrollerError(
          `Invalid item size: Item at index ${itemObj.index} has a height of ${itemSize}px, which is smaller than the expected minimum height of ${expectedMinimum}px (as returned by getMinItemSize(${itemObj.index})).`,
        );
      }
    });
  }, [items, getMinItemSize, scrollDirection, enabled]);
}
