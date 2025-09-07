import { useCallback, useEffect, useRef } from "react";
import {
  ObservedDimensions,
  UseDimensionObserverProps,
} from "../types/hooks/use-dimension-observer";
import { ProceduralScrollerError } from "../lib/error";

export function useDimensionObserver<ElementType extends HTMLElement>({
  dimensions,
  elementRef,
  resizeHandler,
}: UseDimensionObserverProps<ElementType>) {
  const observedDimensions = useRef<ObservedDimensions<ElementType> | null>(
    null,
  );

  const guardedResizeHandler = useCallback(() => {
    function htmlPropertyIsNumeric(value: unknown): value is number {
      if (typeof value !== "number") {
        throw new ProceduralScrollerError(
          `${value} must be a number property of a HTMLElement, received: ${value} (${typeof value})`,
          { value },
        );
      }
      return true;
    }
    const element = elementRef.current;
    if (!element) return;
    if (observedDimensions.current) {
      let didResize = false;
      for (const dim of Object.keys(
        observedDimensions.current,
      ) as (keyof typeof observedDimensions.current)[]) {
        if (element[dim] !== observedDimensions.current[dim]) {
          didResize = true;
        }
        if (htmlPropertyIsNumeric(element[dim])) {
          observedDimensions.current[dim] = element[dim] as number;
        }
      }
      if (!didResize) return;
    } else {
      const initialDimensions: Partial<ObservedDimensions<ElementType>> = {};
      dimensions.forEach((dim) => {
        if (htmlPropertyIsNumeric(element[dim])) {
          initialDimensions[dim] = element[dim] as number;
        }
      });
      observedDimensions.current =
        initialDimensions as ObservedDimensions<ElementType>;
    }
    resizeHandler(element);
  }, [dimensions, elementRef, resizeHandler]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver(guardedResizeHandler);
    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef, guardedResizeHandler]);
}
