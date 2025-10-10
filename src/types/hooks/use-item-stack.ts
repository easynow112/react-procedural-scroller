import { RangeScaledSizes } from "../range-scaled-sizes";
import { Dispatch, RefObject, SetStateAction } from "react";
import { Scroll } from "../scroll";
import { Items } from "../items";
import { Integer } from "../number/integer";
import { NonNegativeReal } from "../number/non-negative-real";

export type UseItemStackProps<ContainerType> = {
  scrollDirection: "vertical" | "horizontal";
  rangeScaledSizes: RangeScaledSizes;
  containerRef: RefObject<ContainerType | null>;
  scroll: Scroll | null;
  getMinItemSize: (index: number) => number;
  minIndex: Integer | null;
  maxIndex: Integer | null;
  initialContainerSize: NonNegativeReal | null;
};

export type UseItemStackResult<ItemType> = {
  items: Items | null;
  setItems: Dispatch<SetStateAction<Items | null>>;
  getRef: (key: string | number) => RefObject<ItemType | null> | undefined;
  getRefOrError: <RequireNonNull extends boolean>(
    key: string | number,
    requireNonNull: RequireNonNull,
  ) => RequireNonNull extends true
    ? RefObject<ItemType>
    : RefObject<ItemType | null>;
};
