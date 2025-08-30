import { Integer } from "../../types/number/integer";
import { ProceduralScrollerError } from "../../lib/error";

export function asInteger(n: number): Integer {
  if (!Number.isInteger(n) || !isFinite(n)) {
    throw new ProceduralScrollerError(
      `Expected an integer number, received n=${n}`,
      { n },
    );
  }
  return n as Integer;
}

export function isInteger(input: number): input is Integer {
  try {
    asInteger(input);
    return true;
  } catch {
    return false;
  }
}
