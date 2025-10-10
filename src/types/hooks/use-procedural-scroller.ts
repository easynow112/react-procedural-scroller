import { Scroll } from "../scroll";
import { RefObject } from "react";

type ScrollInput = Omit<Scroll, "index"> & { index: number };

export interface ScrollToIndexInput extends ScrollInput {
  behavior?: "smooth" | "instant";
}

export type UseProceduralScrollerProps = {
  getMinItemSize: (index: number) => number;
  initialScroll?: ScrollInput;
  scrollAreaScale?: number;
  minIndex?: number;
  maxIndex?: number;
  paddingAreaScale?: {
    start: number;
    end: number;
  };
  scrollDirection?: "vertical" | "horizontal";
  initialContainerSize?: number;
  validateLayouts?: {
    container?: boolean;
    items?: boolean;
  };
};

export type UseProceduralScrollerResult<ContainerType, ItemType> = {
  scrollToIndex: (input: ScrollToIndexInput) => void;
  container: {
    ref: RefObject<ContainerType | null>;
  };
  items:
    | {
        index: number;
        ref: RefObject<ItemType | null>;
      }[]
    | null;
};
