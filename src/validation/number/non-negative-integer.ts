import { NonNegativeInteger } from "../../types/number/non-negative-integer";
import { ProceduralScrollerError } from "../../lib/error";

export function asNonNegativeInteger(n: number): NonNegativeInteger {
  if (!Number.isInteger(n) || Number(n) < 0 || !isFinite(n)) {
    throw new ProceduralScrollerError(
      `Expected a non-negative integer number, received n=${n}`,
      { n },
    );
  }
  return n as NonNegativeInteger;
}

export function isNonNegativeInteger(n: number): n is NonNegativeInteger {
  try {
    asNonNegativeInteger(n);
    return true;
  } catch {
    return false;
  }
}
