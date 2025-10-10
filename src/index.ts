import { useProceduralScroller } from "./hooks/use-procedural-scroller";

export { useProceduralScroller };

export type Item<ItemType extends HTMLElement> = NonNullable<
  ReturnType<typeof useProceduralScroller<HTMLElement, ItemType>>["items"]
>[number];
