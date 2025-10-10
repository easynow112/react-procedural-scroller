import { NonNegativeReal } from "./number/non-negative-real";
import { ItemRange } from "./items";

export type RangeScaledSizes = {
  [key in ItemRange]: NonNegativeReal;
};
