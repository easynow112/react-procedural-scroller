import { useEffect, useRef } from "react";
import { UseUnboundedHeightCheckProps } from "../types/hooks/use-unbounded-height-check";
import { Integer } from "../types/number/integer";
import { asNonNegativeInteger } from "../validation/number/non-negative-integer";
import { ProceduralScrollerError } from "../lib/error";

const checks = 2;

export function useUnboundedHeightCheck<
  ContainerType extends HTMLElement,
  ItemType extends HTMLElement,
>({
  items,
  containerRef,
  scrollDirection,
  enabled,
}: UseUnboundedHeightCheckProps<ContainerType, ItemType>) {
  const count = useRef<Integer>(asNonNegativeInteger(0));
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) {
      return;
    }
    const scrollSizeAccessor =
      scrollDirection === "horizontal" ? "scrollWidth" : "scrollHeight";
    const clientSizeAccessor =
      scrollDirection === "horizontal" ? "clientWidth" : "clientHeight";
    if (container[scrollSizeAccessor] === container[clientSizeAccessor]) {
      count.current = asNonNegativeInteger(count.current + 1);
    } else {
      count.current = asNonNegativeInteger(0);
    }
    if (count.current >= checks) {
      throw new ProceduralScrollerError<never>(
        `Unbounded container detected: The container’s ${scrollSizeAccessor} and ${clientSizeAccessor} were equal for ${checks} consecutive renders. This suggests the container’s size is not constrained, so scrolling cannot occur. This check can be disabled by passing \`validateLayouts = { container: false }\` into useProceduralScroller.`,
      );
    }
  }, [containerRef, enabled, items, scrollDirection]);
}
