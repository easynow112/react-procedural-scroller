import {
  UseProceduralScrollerProps,
  UseProceduralScrollerResult,
} from "./use-procedural-scroller";

export type UseItemSizeCheckProps<
  ContainerType extends HTMLElement,
  ItemType extends HTMLElement,
> = {
  items: UseProceduralScrollerResult<ContainerType, ItemType>["items"];
  getMinItemSize: UseProceduralScrollerProps["getMinItemSize"];
  scrollDirection: "vertical" | "horizontal";
  enabled: boolean;
};
