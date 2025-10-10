import { Integer } from "../types/number/integer";
import { asInteger } from "./number/integer";
import { ProceduralScrollerError } from "../lib/error";

export function asArrayOfConsecutiveIntegers(
  array: number[],
  dir: "asc" | "desc" = "asc",
): Integer[] {
  function throwError(message: string) {
    throw new ProceduralScrollerError(
      `Invalid array of consecutive integers: ${message}`,
      { array, dir },
    );
  }
  if (!Array.isArray(array)) {
    throwError("Input is not an array");
  }
  let increment: number = 1;
  if (dir === "asc") {
    increment = 1;
  } else if (dir === "desc") {
    increment = -1;
  } else {
    throwError("dir is invalid");
  }
  array.forEach((currentValue, index) => {
    asInteger(currentValue);
    if (index < array.length - 1) {
      const nextValue = asInteger(array[index + 1]);
      if (currentValue + increment !== nextValue) {
        throwError(
          `Non-consecutive values found at indexes ${index} and ${index + 1}.`,
        );
      }
    }
  });
  return array.map((value) => asInteger(value));
}
