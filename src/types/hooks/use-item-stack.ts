import { Dimensions } from "../dimensions";
import { RangeScaledSizes } from "../range-scaled-sizes";
import { Dispatch, RefObject, SetStateAction } from "react";
import { Scroll } from "../scroll";
import { Items } from "../items";
import { Integer } from "../number/integer";

export type UseItemStackProps<ContainerType> = {
  dimensions: Dimensions;
  rangeScaledSizes: RangeScaledSizes;
  containerRef: RefObject<ContainerType | null>;
  scroll: Scroll | null;
  getMinItemSize: (index: number) => number;
  minIndex: Integer | null;
  maxIndex: Integer | null;
};

export type UseItemStackResult<ItemType> = {
  items: Items | null;
  setItems: Dispatch<SetStateAction<Items | null>>;
  getRef: (key: string | number) => RefObject<ItemType | null> | undefined;
  getRefOrError: (key: string | number) => RefObject<ItemType | null>;
};
