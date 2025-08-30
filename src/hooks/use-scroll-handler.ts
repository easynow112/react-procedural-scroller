import { useEffect } from "react";
import { UseScrollHandlerProps } from "../types/hooks/use-scroll-handler";

export function useScrollHandler<ElementType extends HTMLElement>({
  elementRef,
  handler,
}: UseScrollHandlerProps<ElementType>) {
  useEffect(() => {
    function safeHandler(this: ElementType, ev: Event): void {
      const element = elementRef?.current;
      if (!element) return;
      handler(element, ev);
    }
    const element = elementRef.current;
    if (!element) return;
    element.addEventListener("scroll", safeHandler);
    return () => {
      element.removeEventListener("scroll", safeHandler);
    };
  }, [elementRef, handler]);
}
