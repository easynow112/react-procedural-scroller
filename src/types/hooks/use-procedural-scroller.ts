import { Scroll } from "../scroll";
import { RefObject } from "react";

type ScrollInput = Omit<Scroll, "index"> & { index: number };

export interface ScrollToIndexInput extends ScrollInput {
  behavior?: "smooth" | "instant";
}

export type UseProceduralScrollerProps = {
  initialScroll: ScrollInput;
  getMinItemSize: (index: number) => number;
  scrollAreaScale?: number;
  minIndex?: number;
  maxIndex?: number;
  paddingAreaScale?: {
    start: number;
    end: number;
  };
  scrollDirection?: "vertical" | "horizontal";
};

export type UseProceduralScrollerResult<ContainerType, ItemType> = {
  scrollToIndex: (input: ScrollToIndexInput) => void;
  container: {
    ref: RefObject<ContainerType | null>;
  };
  rows:
    | {
        index: number;
        ref: RefObject<ItemType | null>;
      }[]
    | null;
};
