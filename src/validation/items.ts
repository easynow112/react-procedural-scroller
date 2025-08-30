import { isInteger } from "./number/integer";
import { isNonNegativeInteger } from "./number/non-negative-integer";
import { itemRangeKeys, Items } from "../types/items";
import { ProceduralScrollerError } from "../lib/error";

function asItemsRangePointers(
  input: Items["rangePointers"],
): Items["rangePointers"] {
  const errorPrefix = `Invalid rangePointers object:`;
  if (
    typeof input !== "object" ||
    input === null ||
    Object.keys(input).length !== itemRangeKeys.length
  ) {
    throw new ProceduralScrollerError(
      `${errorPrefix} Expected an object with ${itemRangeKeys.length} keys`,
      { input },
    );
  }
  for (const key of itemRangeKeys) {
    const inputAsRangePointers = input as Items["rangePointers"];
    if (
      !Array.isArray(inputAsRangePointers[key]) ||
      inputAsRangePointers[key].length !== 2 ||
      !isNonNegativeInteger(inputAsRangePointers[key][0]) ||
      !isNonNegativeInteger(inputAsRangePointers[key][1])
    ) {
      throw new ProceduralScrollerError(
        `${errorPrefix} Invalid pointer array for key=${key}`,
        { input },
      );
    }
  }
  return input as Items["rangePointers"];
}

export function asItems(input: Items): Items {
  const errorPrefix = "Invalid items object:";
  const expectedKeys = 2;
  if (
    typeof input !== "object" ||
    input === null ||
    Object.keys(input).length !== expectedKeys
  ) {
    throw new ProceduralScrollerError(
      `${errorPrefix} Expected an object with ${expectedKeys} keys`,
      { input },
    );
  }
  const inputAsItems = input as Items;
  asItemsRangePointers(inputAsItems.rangePointers);
  if (!Array.isArray(inputAsItems.indexes)) {
    throw new ProceduralScrollerError(
      `${errorPrefix} Expected items.indexes to be an array`,
      { input },
    );
  }
  for (let i = 0; i < inputAsItems.indexes.length; i++) {
    if (!isInteger(inputAsItems.indexes[i])) {
      throw new ProceduralScrollerError(
        `${errorPrefix} items.indexes[${i}] is not an integer`,
        { input },
      );
    }
    if (i > 0 && i < inputAsItems.indexes.length - 1) {
      if (inputAsItems.indexes[i - 1] !== inputAsItems.indexes[i] - 1) {
        throw new ProceduralScrollerError(
          `${errorPrefix} items.indexes[${i - 1}] and items.indexes[${i}] are not consecutive`,
          { input },
        );
      }
      if (inputAsItems.indexes[i + 1] !== inputAsItems.indexes[i] + 1) {
        throw new ProceduralScrollerError(
          `${errorPrefix} items.indexes[${i}] and items.indexes[${i + 1}] are not consecutive`,
          { input },
        );
      }
    }
  }
  return input;
}
