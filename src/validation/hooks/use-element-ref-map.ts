import { ProceduralScrollerError } from "../../lib/error";

export function asElementRefMapKey(input: unknown): string {
  function throwError(message: string) {
    throw new ProceduralScrollerError(
      `Invalid element ref map key: ${message}`,
      { input },
    );
  }
  if (typeof input !== "string" && typeof input !== "number") {
    throwError(`Expected key to be a number or a string`);
  }
  return String(input) as string;
}
