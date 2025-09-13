import { expect, test } from "@playwright/test";
import { getContainer, getItemsArray } from "../lib/locators";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { getMinItemSize } from "../../app/src/lib/items";
import { expectIndexesToBeValid } from "../lib/indexes";
import { easeOutScroll } from "../lib/scroll";
import { ScenarioProps } from "../../app/src/types/scenarios";

function getMaxScrollDistance(
  initialScrollIndex: number,
  minIndex: number,
  minItemSize: ScenarioProps["minItemSize"],
) {
  let scrollDistance = 0;
  for (let i = initialScrollIndex - 1; i >= minIndex; i--) {
    scrollDistance += getMinItemSize(minItemSize, i);
  }
  return scrollDistance * 2;
}

test("In vertical scrolling mode, items with an index lower than minIndex should not be rendered.", async ({
  page,
}) => {
  const itemsBehindInitialScrollPos = 20;
  const props: ScenarioProps = getData().scenarioProps;
  const minIndex = props.initialScroll.index - itemsBehindInitialScrollPos;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({
      ...props,
      scrollDirection: "vertical",
      minIndex,
      initialScroll: {
        index: props.initialScroll.index,
        block: "start",
      },
    })}`,
  );
  await page.waitForTimeout(300);
  const container = await getContainer(page);
  // 1.) Calculate the scroll distance until minIndex causes the container to stop scrolling:
  const scrollDistance = getMaxScrollDistance(
    props.initialScroll.index,
    minIndex,
    props.minItemSize,
  );
  // 2.) Check for valid scrollTop and index values before scroll
  const indexesBeforeScroll = await getItemsArray(page);
  const scrollTopBeforeScroll = await container.locator.evaluate(
    (el) => el.scrollTop,
  );
  expectIndexesToBeValid(indexesBeforeScroll);
  expect(indexesBeforeScroll[0]).toBeGreaterThanOrEqual(minIndex);
  expect(scrollTopBeforeScroll).toBeGreaterThan(0);
  // 3.) Execute scroll
  await easeOutScroll([0, -1 * scrollDistance], container.locator);
  // 4.) Check for valid scrollTop and index values after scroll
  const indexesAfterScroll = await getItemsArray(page);
  const scrollTopAfterScroll = await container.locator.evaluate(
    (el) => el.scrollTop,
  );
  expectIndexesToBeValid(indexesBeforeScroll);
  expect(indexesAfterScroll[0]).toBe(minIndex);
  expect(scrollTopAfterScroll).toBe(0);
});

test("In horizontal scrolling mode, items with an index lower than minIndex should not be rendered.", async ({
  page,
}) => {
  const itemsBehindInitialScrollPos = 20;
  const props: ScenarioProps = getData().scenarioProps;
  const minIndex = props.initialScroll.index - itemsBehindInitialScrollPos;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({
      ...props,
      scrollDirection: "horizontal",
      minIndex,
      initialScroll: {
        index: props.initialScroll.index,
        block: "start",
      },
    })}`,
  );
  await page.waitForTimeout(300);
  const container = await getContainer(page);
  // 1.) Calculate the scroll distance until minIndex causes the container to stop scrolling:
  const scrollDistance = getMaxScrollDistance(
    props.initialScroll.index,
    minIndex,
    props.minItemSize,
  );
  // 2.) Check for valid scrollLeft and index values before scroll
  const indexesBeforeScroll = await getItemsArray(page);
  const scrollLeftBeforeScroll = await container.locator.evaluate(
    (el) => el.scrollLeft,
  );
  expectIndexesToBeValid(indexesBeforeScroll);
  expect(indexesBeforeScroll[0]).toBeGreaterThanOrEqual(minIndex);
  expect(scrollLeftBeforeScroll).toBeGreaterThan(0);
  // 3.) Execute scroll
  await easeOutScroll([-1 * scrollDistance, 0], container.locator);
  // 4.) Check for valid scrollLeft and index values after scroll
  const indexesAfterScroll = await getItemsArray(page);
  const scrollLeftAfterScroll = await container.locator.evaluate(
    (el) => el.scrollLeft,
  );
  expectIndexesToBeValid(indexesBeforeScroll);
  expect(indexesAfterScroll[0]).toBe(minIndex);
  expect(scrollLeftAfterScroll).toBe(0);
});
