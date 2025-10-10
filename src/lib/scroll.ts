import { Scroll, scrollBlocks } from "../types/scroll";
import { ProceduralScrollerError } from "./error";
import { ScrollToIndexInput } from "../types/hooks/use-procedural-scroller";
import { asInteger } from "../validation/number/integer";
import { getElementSize } from "./dimensions";

export function getScrollLength<
  ContainerType extends HTMLElement,
  ItemType extends HTMLElement,
>(
  block: Scroll["block"],
  container: ContainerType,
  item: ItemType,
  scrollDirection: "horizontal" | "vertical",
) {
  // Validation
  if (scrollBlocks.indexOf(block) === -1) {
    throw new ProceduralScrollerError("Invalid scroll block", { block });
  }
  // Compute scroll length
  const containerSize = getElementSize(container, scrollDirection, {
    includePadding: true,
    includeBorder: false,
    includeMargin: false,
  });
  const itemSize = getElementSize(item, scrollDirection, {
    includePadding: true,
    includeBorder: true,
    includeMargin: false,
  });
  const relativeOffset = computeRelativeOffset(
    container,
    item,
    scrollDirection,
  );
  if (block === "start") {
    return relativeOffset;
  } else if (block === "end") {
    return relativeOffset - (containerSize - itemSize);
  } else if (block === "center") {
    return relativeOffset - (containerSize - itemSize) / 2;
  } else {
    throw new ProceduralScrollerError(`Invalid scroll block`, { block });
  }
}

export function scrollToIndexInputToScroll(
  input: ScrollToIndexInput | null,
): Scroll | null {
  if (!input) {
    return null;
  }
  return {
    block: input.block,
    index: asInteger(input.index),
  };
}

export function computeRelativeOffset<
  ContainerType extends HTMLElement,
  ItemType extends HTMLElement,
>(
  container: ContainerType,
  item: ItemType,
  scrollDirection: "horizontal" | "vertical",
): number {
  const isHorizontal = scrollDirection === "horizontal";
  const containerScroll = container[isHorizontal ? "scrollLeft" : "scrollTop"];
  const itemViewportOffset =
    item.getBoundingClientRect()[isHorizontal ? "left" : "top"] +
    containerScroll;
  const containerViewportOffset =
    container.getBoundingClientRect()[isHorizontal ? "left" : "top"] +
    (isHorizontal ? container.clientLeft : container.clientTop);
  return itemViewportOffset - containerViewportOffset;
}
