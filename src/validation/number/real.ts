import { ProceduralScrollerError } from "../../lib/error";
import { Real } from "../../types/number/real";

export function asReal(n: number): Real {
  if (!isReal(n)) {
    throw new ProceduralScrollerError(
      `Expected a real number, received n=${n}`,
      { n },
    );
  }
  return n as Real;
}

export function isReal(input: unknown): input is Real {
  return typeof input === "number" && isFinite(input) && !isNaN(input);
}
