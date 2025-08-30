import { Scroll, scrollBlocks } from "../types/scroll";
import { isInteger } from "./number/integer";
import { ProceduralScrollerError } from "../lib/error";

export function asScroll(input: unknown): Scroll {
  function throwError(message: string) {
    throw new ProceduralScrollerError(`Invalid scroll object: ${message}`, {
      input,
    });
  }
  const expectedKeys = 2;
  if (
    typeof input !== "object" ||
    input === null ||
    Object.keys(input).length !== expectedKeys
  ) {
    throwError(`Expected an object with ${expectedKeys} keys`);
  }
  if (scrollBlocks.indexOf((input as Scroll)?.block) === -1) {
    throwError(`Invalid scroll.block value`);
  }
  if (!isInteger((input as Scroll)?.index)) {
    throwError(`Expected scroll.index to be an integer`);
  }
  return input as Scroll;
}
