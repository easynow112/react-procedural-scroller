import { memo } from "react";
import { type Item } from "react-procedural-scroller";

export default memo(
  function Item({ item }: { item: Item<HTMLDivElement> }) {
    /* Generate a date relative to today based on the item's index
       (e.g., index 0 = today, 1 = tomorrow, -1 = yesterday). */
    const date = new Date();
    date.setDate(date.getDate() + item.index);

    return (
      <div
        ref={item.ref} // Enables the hook to measure and virtualize this item.
        style={{
          minHeight: 100, // Must match or exceed the result of getMinItemSize(index) in the container.
          borderTop: "1px solid lightgrey",
        }}
      >
        <p
          style={{
            fontFamily: "Helvetica",
            color: "grey",
            padding: "10px",
          }}
        >
          {date.toDateString()}
        </p>
      </div>
    );
  },
  /*
   * Since an <Item /> component’s content is generated entirely from its index,
   * it is highly recommended to wrap it in React.memo with a custom comparison
   * function that prevents re-renders unless this index changes.
   */
  (prevProps, nextProps) => prevProps.item.index === nextProps.item.index,
);
