import { ProceduralScrollerError } from "../../lib/error";

export type NonNegativeReal = number & { __nonNegativeReal: true };

export function asNonNegativeReal(n: number): NonNegativeReal {
  if (typeof n !== "number" || isNaN(n) || !isFinite(n) || Number(n) < 0) {
    throw new ProceduralScrollerError(
      `Expected a non-negative real number, received n=${n}`,
      { n },
    );
  }
  return n as NonNegativeReal;
}

export function isNonNegativeReal(n: number): n is NonNegativeReal {
  try {
    asNonNegativeReal(n);
    return true;
  } catch {
    return false;
  }
}
