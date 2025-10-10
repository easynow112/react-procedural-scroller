import { expect, test, Page, ElementHandle } from "@playwright/test";
import { getContainer, getItemsArray, getItem } from "../lib/locators";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { getMinItemSize } from "../../app/src/lib/items";
import { expectIndexesToBeValid } from "../lib/indexes";
import { easeOutScroll } from "../lib/scroll";
import { ScenarioProps } from "../../app/src/types/scenarios";
import { itemIsVisibleInContainer } from "../lib/dimensions";

type ScrollDirection = "vertical" | "horizontal";
type BoundType = "min" | "max";

// This function calculates how far to scroll until hitting minIndex/maxIndex
function getScrollDistance(
  initialIndex: number,
  boundIndex: number,
  minItemSize: ScenarioProps["minItemSize"],
): number {
  let distance = 0;
  if (boundIndex > initialIndex) {
    for (let i = initialIndex + 1; i <= boundIndex; i++) {
      distance += getMinItemSize(minItemSize, i);
    }
  } else {
    for (let i = initialIndex - 1; i >= boundIndex; i--) {
      distance += getMinItemSize(minItemSize, i);
    }
  }
  return distance * 2;
}

async function runBoundedScrollTest(
  page: Page,
  scrollDirection: ScrollDirection,
  boundType: BoundType,
) {
  // 1.) Setup
  const itemsOffset = 20;
  const props: ScenarioProps = getData().scenarioProps;
  const boundIndex =
    boundType === "max"
      ? props.initialScroll.index + itemsOffset
      : props.initialScroll.index - itemsOffset;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({
      ...props,
      scrollDirection,
      [boundType + "Index"]: boundIndex,
      initialScroll: {
        index: props.initialScroll.index,
        block: boundType === "max" ? "end" : "start",
      },
    })}`,
  );
  const isVertical = scrollDirection === "vertical";
  const container = await getContainer(page);
  const scrollDistance = getScrollDistance(
    props.initialScroll.index,
    boundIndex,
    props.minItemSize,
  );

  // 2.) Check that the initial items / scroll position is within the index bounds
  const indexesBefore = await getItemsArray(page);
  expectIndexesToBeValid(indexesBefore);
  if (boundType === "max") {
    expect(indexesBefore[indexesBefore.length - 1]).toBeLessThanOrEqual(
      boundIndex,
    );
  } else {
    expect(indexesBefore[0]).toBeGreaterThanOrEqual(boundIndex);
  }

  // 3.) Attempt to scroll to a point outside the index bounds
  const delta: [number, number] = isVertical
    ? [0, boundType === "max" ? scrollDistance : -scrollDistance]
    : [boundType === "max" ? scrollDistance : -scrollDistance, 0];
  await easeOutScroll(delta, container);

  // 4.) Check that the index bounds have been hit
  const boundItem = await getItem(page, boundIndex);
  const indexesAfter = await getItemsArray(page);
  expectIndexesToBeValid(indexesAfter);
  await expect(boundItem).toBeAttached();
  const boundItemHandle =
    (await boundItem.elementHandle()) as ElementHandle<HTMLElement>;
  const containerHandle =
    (await container.elementHandle()) as ElementHandle<HTMLElement>;
  if (boundType === "max") {
    expect(indexesAfter[indexesAfter.length - 1]).toBe(boundIndex);
    expect(
      await itemIsVisibleInContainer(
        page,
        boundItemHandle,
        containerHandle,
        0.5,
      ),
    ).toBe(true);
  } else {
    expect(indexesAfter[0]).toBe(boundIndex);
    expect(
      await itemIsVisibleInContainer(
        page,
        boundItemHandle,
        containerHandle,
        0.5,
      ),
    ).toBe(true);
  }
}

test("Vertical: items beyond maxIndex are not rendered", async ({ page }) => {
  await runBoundedScrollTest(page, "vertical", "max");
});

test("Horizontal: items beyond maxIndex are not rendered", async ({ page }) => {
  await runBoundedScrollTest(page, "horizontal", "max");
});

test("Vertical: items below minIndex are not rendered", async ({ page }) => {
  await runBoundedScrollTest(page, "vertical", "min");
});

test("Horizontal: items below minIndex are not rendered", async ({ page }) => {
  await runBoundedScrollTest(page, "horizontal", "min");
});
