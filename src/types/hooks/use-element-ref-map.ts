import { RefObject } from "react";
import { PositiveInteger } from "../number/positive-integer";

export type UseElementRefMapResult<ElementType> = {
  setRef: (
    key: string | number,
    ref: RefObject<ElementType | null>,
  ) => RefObject<ElementType | null>;
  getRef: (key: string | number) => RefObject<ElementType | null> | undefined;
  getRefOrError: <RequireNonNull extends boolean>(
    key: string | number,
    requireNonNull: RequireNonNull,
  ) => RequireNonNull extends true
    ? RefObject<ElementType>
    : RefObject<ElementType | null>;
  getAllRefs: () => Record<string, RefObject<ElementType | null>>;
  clearRefs: () => void;
};

export type UseElementRefMapProps = {
  cacheLimit?: PositiveInteger;
};
