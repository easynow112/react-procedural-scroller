import { Integer } from "./number/integer";
import { NonNegativeInteger } from "./number/non-negative-integer";

export const itemRangeKeys = [
  "startPadding",
  "startContent",
  "content",
  "endContent",
  "endPadding",
] as const;

export type ItemRange = (typeof itemRangeKeys)[number];

export type Items = {
  indexes: Integer[];
  rangePointers: {
    [key in ItemRange]: [NonNegativeInteger, NonNegativeInteger];
  };
};
