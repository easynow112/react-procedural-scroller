import { RefObject } from "react";
import { UseProceduralScrollerResult } from "./use-procedural-scroller";

export type UseUnboundedHeightCheckProps<
  ContainerType extends HTMLElement,
  ItemType extends HTMLElement,
> = {
  items: UseProceduralScrollerResult<ContainerType, ItemType>["items"];
  containerRef: RefObject<ContainerType | null>;
  scrollDirection: "horizontal" | "vertical";
  enabled: boolean;
};
