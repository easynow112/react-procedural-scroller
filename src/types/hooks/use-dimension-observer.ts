import { RefObject } from "react";

export type UseDimensionObserverProps<ElementType extends HTMLElement> = {
  dimensions: (keyof ElementType)[];
  elementRef: RefObject<ElementType | null>;
  resizeHandler: (element: ElementType) => void;
};

export type ObservedDimensions<ElementType> = {
  [K in keyof ElementType]: number;
};
