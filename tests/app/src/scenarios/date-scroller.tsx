import { useProceduralScroller } from "react-procedural-scroller";
import DateItem from "../components/items/date-item.tsx";
import { getMinItemSize } from "../lib/items.ts";
import { type ScenarioProps } from "../types/scenarios.ts";

export default function DateScroller({
  initialScroll,
  minItemSize,
  scrollAreaScale,
  minIndex,
  maxIndex,
  paddingAreaScale,
  scrollDirection,
  containerBox,
  itemBox,
  wrapperBox,
  validateLayouts,
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
      style={{
        display: "flex",
        gap: "20px",
        padding: wrapperBox?.padding,
        margin: wrapperBox?.margin,
      }}
    >
      <div
        data-testid={`container`}
        style={{
          display: "flex",
          flexDirection: scrollDirection === "vertical" ? "column" : "row",
          overflow: "scroll",
          width: containerBox?.width || 600,
          height: containerBox?.height || 600,
          minWidth: containerBox?.width || 600,
          minHeight: containerBox?.height || 600,
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
      <div>
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
            padding: 10,
            cursor: "pointer",
          }}
        >
          Back to today!
        </button>
      </div>
    </div>
  );
}
