import { PositiveInteger } from "../../types/number/positive-integer";
import { ProceduralScrollerError } from "../../lib/error";

export function asPositiveInteger(n: number): PositiveInteger {
  if (!Number.isInteger(n) || Number(n) < 1 || !isFinite(n)) {
    throw new ProceduralScrollerError(
      `Expected a positive integer number, received n=${n}`,
      { n },
    );
  }
  return n as PositiveInteger;
}
