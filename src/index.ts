import { useProceduralScroller } from "./hooks/use-procedural-scroller";

export { useProceduralScroller };

export type Row<ItemType extends HTMLElement> = NonNullable<
  ReturnType<typeof useProceduralScroller<HTMLElement, ItemType>>["rows"]
>[number];
