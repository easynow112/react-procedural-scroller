import { useProceduralScroller } from "react-procedural-scroller";
import DateItem from "../components/items/date-item.tsx";
import { getMinItemSize } from "../lib/items.ts";
import { type ScenarioProps } from "../types/scenarios.ts";

export default function UnboundedContainerSize({
  initialScroll,
  minItemSize,
  scrollAreaScale,
  minIndex,
  maxIndex,
  paddingAreaScale,
  scrollDirection,
  containerBox,
  itemBox,
  validateLayouts,
}: ScenarioProps) {
  const { items, container } = useProceduralScroller<
    HTMLDivElement,
    HTMLDivElement
  >({
    initialScroll,
    scrollAreaScale,
    getMinItemSize: (index: number) => {
      return getMinItemSize(minItemSize, index);
    },
    minIndex,
    maxIndex,
    paddingAreaScale,
    scrollDirection,
    ...(containerBox
      ? {
          initialContainerSize:
            scrollDirection === "vertical"
              ? containerBox.height
              : containerBox.width,
        }
      : {}),
    validateLayouts,
  });
  return (
    <div
      data-testid={`container`}
      style={{
        position: "fixed",
        display: "flex",
        flexDirection: scrollDirection === "vertical" ? "column" : "row",
        overflow: "scroll",
        margin: containerBox?.margin,
        padding: containerBox?.padding,
        border: containerBox?.border,
        borderRadius: "10px",
      }}
      ref={container.ref}
    >
      {items?.map((item) => (
        <DateItem
          style={{
            ...(scrollDirection === "vertical"
              ? {
                  minHeight: getMinItemSize(minItemSize, item.index),
                }
              : {
                  minWidth: getMinItemSize(minItemSize, item.index),
                }),
            margin: itemBox?.margin,
            padding: itemBox?.padding,
            border: itemBox?.border,
          }}
          key={item.index}
          item={item}
        />
      ))}
    </div>
  );
}
