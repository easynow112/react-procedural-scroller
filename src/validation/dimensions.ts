import { type Dimensions, dimensionKeys } from "../types/dimensions";
import { ProceduralScrollerError } from "../lib/error";

export function asDimensions(input: unknown): Dimensions {
  const errorPrefix = "Invalid dimensions object:";
  if (
    typeof input !== "object" ||
    input === null ||
    Object.keys(input).length !== dimensionKeys.length
  ) {
    throw new ProceduralScrollerError(
      `${errorPrefix} Expected an object with ${dimensionKeys.length} keys`,
      { input, dimensionKeys },
    );
  }
  dimensionKeys.forEach((dimensionKey) => {
    if (
      typeof (input as Dimensions)?.[dimensionKey] !== "string" ||
      (input as Dimensions)[dimensionKey].length < 1
    ) {
      throw new ProceduralScrollerError(
        `${errorPrefix} dimensions.[${dimensionKey}] is not a string`,
        { input, dimensionKeys },
      );
    }
  });
  return input as Dimensions;
}
