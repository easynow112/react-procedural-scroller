import { useProceduralScroller } from "react-procedural-scroller";
import DateItem from "../components/items/date-item.tsx";
import { getMinItemSize } from "../lib/items.ts";
import { type ScenarioProps } from "../types/scenarios.ts";

export default function Container({
  initialScroll,
  minItemSize,
  scrollAreaScale,
  minIndex,
  maxIndex,
  paddingAreaScale,
  scrollDirection,
  containerDimensions,
}: ScenarioProps) {
  const { items, container, scrollToIndex } = useProceduralScroller<
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
    ...(containerDimensions
      ? {
          initialContainerSize:
            scrollDirection === "vertical"
              ? containerDimensions.height
              : containerDimensions.width,
        }
      : {}),
  });
  return (
    <div
      style={{
        position: "relative",
        width: containerDimensions?.width || 600,
        height: containerDimensions?.height || 600,
        margin: "20px",
      }}
    >
      <div
        data-testid={`container`}
        style={{
          display: "flex",
          flexDirection: scrollDirection === "vertical" ? "column" : "row",
          overflow: "scroll",
          height: "100%",
          border: "2px solid lightgrey",
          borderRadius: "10px",
        }}
        ref={container.ref}
      >
        <button
          data-testid={`scrollToIndexButton`}
          onClick={() => {
            scrollToIndex({
              index: initialScroll.index,
              block: initialScroll.block,
              behavior: "smooth",
            });
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: 10,
            cursor: "pointer",
          }}
        >
          Back to today!
        </button>
        {items?.map((item) => (
          <DateItem
            style={{
              ...(scrollDirection === "vertical"
                ? {
                    minHeight: getMinItemSize(minItemSize, item.index),
                    borderTop: "1px solid lightgrey",
                  }
                : {
                    minWidth: getMinItemSize(minItemSize, item.index),
                    borderRight: "1px solid lightgrey",
                  }),
            }}
            key={item.index}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}
