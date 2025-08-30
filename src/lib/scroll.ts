import { Scroll, scrollBlocks } from "../types/scroll";
import { ProceduralScrollerError } from "./error";
import { ScrollToIndexInput } from "../types/hooks/use-procedural-scroller";
import { asInteger } from "../validation/number/integer";

export function getScrollLength(
  block: Scroll["block"],
  containerSize: number,
  itemSize: number,
  itemOffset: number,
) {
  // Validation
  if (scrollBlocks.indexOf(block) === -1) {
    throw new ProceduralScrollerError("Invalid scroll block", { block });
  }
  if (
    typeof containerSize !== "number" ||
    typeof itemSize !== "number" ||
    typeof itemOffset !== "number"
  ) {
    throw new ProceduralScrollerError("Could not compute scroll length", {
      block,
      containerSize,
      itemSize,
      itemOffset,
    });
  }
  // Compute scroll length
  if (block === "start") {
    return itemOffset;
  } else if (block === "end") {
    return itemOffset - (containerSize - itemSize);
  } else if (block === "center") {
    return itemOffset - (containerSize - itemSize) / 2;
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
