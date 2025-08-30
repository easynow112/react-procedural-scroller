import { RefObject } from "react";

export type UseScrollHandlerProps<ElementType> = {
  elementRef: RefObject<ElementType | null>;
  handler: (element: ElementType, ev: Event) => unknown;
};
