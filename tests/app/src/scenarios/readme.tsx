import { useProceduralScroller } from "react-procedural-scroller";
import Item from "../components/items/readme-item.tsx";

export default function Container() {
  const { items, container } = useProceduralScroller<
    HTMLDivElement, // Type of the scrollable container element.
    HTMLDivElement // Type of each item inside the container.
  >({
    // Initial scroll position of the container.
    initialScroll: {
      index: 0, // Index of the item to scroll to initially.
      block: "center", // Alignment of the item in the viewport: "start", "center", or "end".
    },
    /* Callback to return the minimum size of each item along the relevant axis:
      - For vertical scrolling: minimum height.
      - For horizontal scrolling: minimum width. */
    getMinItemSize: () => 100,
    // Direction of scrolling: "vertical" or "horizontal"
    scrollDirection: "vertical",
    /* Optional: `initialContainerSize` defines the height of the container on the
    first page render. Without it, `items` will be null on the first render because the hook
    needs to measure the container's size before determining how many items to render.
    Providing a value makes `items` available immediately and helps avoid layout shift. */
    initialContainerSize: 200,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column", // Must match the hook's `scrollDirection`: "column" - vertical, "row" - horizontal.
        height: "500px",
        width: "500px",
        overflow: "scroll", // The container must be scrollable!
        border: "2px solid lightgrey",
        borderRadius: "10px",
        margin: "30px",
        scrollbarWidth: "none",
      }}
      ref={container.ref} // Enables the hook to track and update the container's scroll position.
    >
      {items?.map((item) => (
        <Item key={item.index} item={item} />
      ))}
    </div>
  );
}
