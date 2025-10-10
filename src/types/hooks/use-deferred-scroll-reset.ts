import { RefObject } from "react";
import { UseElementRefMapResult } from "./use-element-ref-map";
import { Items } from "../items";
import { Scroll } from "../scroll";

export type UseDeferredScrollResetProps<ContainerType, ItemType> = {
  scroll: RefObject<Scroll | null>;
  onScrollReset: () => void;
  containerRef: RefObject<ContainerType | null>;
  items: Items | null;
  getRef: UseElementRefMapResult<ItemType>["getRef"];
  suppress: boolean;
  scrollDirection: "vertical" | "horizontal";
};
