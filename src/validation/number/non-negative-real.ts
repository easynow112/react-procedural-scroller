import { ProceduralScrollerError } from "../../lib/error";

export type NonNegativeReal = number & { __nonNegativeReal: true };

export function asNonNegativeReal(n: number): NonNegativeReal {
  if (!isNonNegativeReal(n)) {
    throw new ProceduralScrollerError(
      `Expected a non-negative real number, received n=${n}`,
      { n },
    );
  }
  return n as NonNegativeReal;
}

export function isNonNegativeReal(n: number): n is NonNegativeReal {
  return !(typeof n !== "number" || isNaN(n) || !isFinite(n) || Number(n) < 0);
}
