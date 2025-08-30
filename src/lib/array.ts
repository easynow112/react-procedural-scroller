import { asArrayOfConsecutiveIntegers } from "../validation/array";
import { Integer } from "../types/number/integer";

export function mergeConsecutiveIntegerArrays(
  ...arrays: Integer[][]
): Integer[] {
  const sortedArrays = arrays
    .slice()
    .filter((a) => a.length > 0)
    .sort((a, b) => {
      return a[0] - b[0];
    })
    .map((array) => asArrayOfConsecutiveIntegers(array));
  const result: Integer[] = [];
  sortedArrays.forEach((array) => {
    array.forEach((value) => {
      if (result.length === 0 || result[result.length - 1] < value) {
        result.push(value);
      }
    });
  });
  return result;
}
