import { expect, test, Page } from "@playwright/test";
import { getContainer, getItemsArray } from "../lib/locators";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { getMinItemSize } from "../../app/src/lib/items";
import { expectIndexesToBeValid } from "../lib/indexes";
import { easeOutScroll } from "../lib/scroll";
import { ScenarioProps } from "../../app/src/types/scenarios";
import { BoundingBox } from "../types/bounding-box";

function getMaxScrollDistance(
  initialScrollIndex: number,
  maxIndex: number,
  minItemSize: ScenarioProps["minItemSize"],
) {
  let scrollDistance = 0;
  for (let i = initialScrollIndex + 1; i <= maxIndex; i++) {
    scrollDistance += getMinItemSize(minItemSize, i);
  }
  return scrollDistance * 2;
}

async function testMaxIndexRendering(page: Page, scrollDirection: "vertical" | "horizontal") {
  const itemsAheadOfInitialScrollPos = 20;
  const props: ScenarioProps = getData().scenarioProps;
  const maxIndex = props.initialScroll.index + itemsAheadOfInitialScrollPos;

  await page.goto(
    `/date-scroller?props=${urlEncodeObject({
      ...props,
      scrollDirection,
      maxIndex,
      initialScroll: {
        index: props.initialScroll.index,
        block: "end",
      },
    })}`,
  );
  await page.waitForTimeout(300);

  const container = await getContainer(page);
  const scrollDistance = getMaxScrollDistance(
    props.initialScroll.index,
    maxIndex,
    props.minItemSize,
  );

  // Determine axis-specific values
  const isVertical = scrollDirection === "vertical";
  const getScrollSize = async () =>
    container.locator.evaluate((el: HTMLElement, isVertical) => isVertical ? el.scrollHeight : el.scrollWidth, isVertical);
  const getScrollPos = async () =>
    container.locator.evaluate((el: HTMLElement, isVertical) => isVertical ? el.scrollTop : el.scrollLeft, isVertical);

  const containerBox = (await container.locator.boundingBox()) as BoundingBox;
  expect(containerBox).not.toBe(null);
  const containerDim = isVertical ? containerBox.height : containerBox.width;

  // Before scroll
  const indexesBeforeScroll = await getItemsArray(page);
  const scrollSizeBefore = await getScrollSize();
  const scrollPosBefore = await getScrollPos();

  expectIndexesToBeValid(indexesBeforeScroll);
  expect(indexesBeforeScroll[indexesBeforeScroll.length - 1]).toBeLessThanOrEqual(maxIndex);
  expect(scrollPosBefore + containerDim).toBeLessThan(scrollSizeBefore);

  // Execute scroll
  await easeOutScroll(isVertical ? [0, scrollDistance] : [scrollDistance, 0], container.locator);

  // After scroll
  const indexesAfterScroll = await getItemsArray(page);
  const scrollSizeAfter = await getScrollSize();
  const scrollPosAfter = await getScrollPos();

  expectIndexesToBeValid(indexesBeforeScroll);
  expect(indexesAfterScroll[indexesAfterScroll.length - 1]).toBe(maxIndex);
  expect(Math.abs(scrollPosAfter + containerDim - scrollSizeAfter)).toBeLessThan(5);
}

// Vertical test
test("Vertical: items beyond maxIndex are not rendered", async ({ page }) => {
  await testMaxIndexRendering(page, "vertical");
});

// Horizontal test
test("Horizontal: items beyond maxIndex are not rendered", async ({ page }) => {
  await testMaxIndexRendering(page, "horizontal");
});
