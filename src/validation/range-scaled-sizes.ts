import { isNonNegativeReal } from "./number/non-negative-real";
import { itemRangeKeys } from "../types/items";
import { RangeScaledSizes } from "../types/range-scaled-sizes";
import { ProceduralScrollerError } from "../lib/error";

export function asRangeScaledSizes(input: RangeScaledSizes): RangeScaledSizes {
  const errorPrefix = "Received invalid rangeScaledSizes value:";
  if (
    typeof input !== "object" ||
    Object.keys(input).length !== itemRangeKeys.length
  ) {
    throw new ProceduralScrollerError(
      `${errorPrefix} Expected object with ${itemRangeKeys.length} keys.`,
      { input, itemRangeKeys },
    );
  }
  itemRangeKeys.forEach((key) => {
    if (!isNonNegativeReal(input[key])) {
      throw new ProceduralScrollerError(
        `${errorPrefix} Expected rangeScaledSizes[${key}] to be a non-negative real number.`,
        { input, itemRangeKeys },
      );
    }
  });
  return input;
}
