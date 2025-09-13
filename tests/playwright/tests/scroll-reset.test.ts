import { expect, test } from "@playwright/test";
import { easeOutScroll } from "../lib/scroll";
import { getContainer, getItemsArray } from "../lib/locators";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { expectIndexesToBeValid } from "../lib/indexes";
import { ScenarioProps } from "../../app/src/types/scenarios";

test("Scrolling up should result in a scroll reset where item indexes decrease", async ({
  page,
}) => {
  const props: ScenarioProps = getData().scenarioProps;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({ ...props, scrollDirection: "vertical" })}`,
  );
  const indexesBeforeScroll = await getItemsArray(page);
  expectIndexesToBeValid(indexesBeforeScroll);
  const container = await getContainer(page);
  await easeOutScroll([0, -1 * container.scrollHeight], container.locator);
  const indexesAfterScroll = await getItemsArray(page);
  expectIndexesToBeValid(indexesAfterScroll);
  expect(indexesAfterScroll[0]).toBeLessThan(indexesBeforeScroll[0]);
});

test("Scrolling down should result in a scroll reset where item indexes increase", async ({
  page,
}) => {
  const props: ScenarioProps = getData().scenarioProps;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({ ...props, scrollDirection: "vertical" })}`,
  );
  const indexesBeforeScroll = await getItemsArray(page);
  expectIndexesToBeValid(indexesBeforeScroll);
  const container = await getContainer(page);
  await easeOutScroll([0, container.scrollHeight], container.locator);
  const indexesAfterScroll = await getItemsArray(page);
  expectIndexesToBeValid(indexesAfterScroll);
  expect(indexesAfterScroll[0]).toBeGreaterThan(indexesBeforeScroll[0]);
});

test("Scrolling to the right should result in a scroll reset where item indexes increase", async ({
  page,
}) => {
  const props: ScenarioProps = getData().scenarioProps;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({ ...props, scrollDirection: "horizontal" })}`,
  );
  const indexesBeforeScroll = await getItemsArray(page);
  expectIndexesToBeValid(indexesBeforeScroll);
  const container = await getContainer(page);
  await easeOutScroll([container.scrollWidth, 0], container.locator);
  const indexesAfterScroll = await getItemsArray(page);
  expectIndexesToBeValid(indexesAfterScroll);
  expect(indexesAfterScroll[0]).toBeGreaterThan(indexesBeforeScroll[0]);
});

test("Scrolling to the left should result in a scroll reset where item indexes decrease", async ({
  page,
}) => {
  const props: ScenarioProps = getData().scenarioProps;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({ ...props, scrollDirection: "horizontal" })}`,
  );
  const indexesBeforeScroll = await getItemsArray(page);
  expectIndexesToBeValid(indexesBeforeScroll);
  const container = await getContainer(page);
  await easeOutScroll([-1 * container.scrollWidth, 0], container.locator);
  const indexesAfterScroll = await getItemsArray(page);
  expectIndexesToBeValid(indexesAfterScroll);
  expect(indexesAfterScroll[0]).toBeLessThan(indexesBeforeScroll[0]);
});
