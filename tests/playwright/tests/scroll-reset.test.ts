import { expect, Locator, Page, test } from "@playwright/test";
import { easeOutScroll } from "../lib/scroll";
import { getContainer, getItemsArray } from "../lib/locators";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { expectIndexesToBeValid } from "../lib/indexes";
import { ScenarioProps } from "../../app/src/types/scenarios";

type ScrollOptions = {
  direction: "vertical" | "horizontal";
  scrollDelta: (container: Locator) => Promise<[number, number]>;
  comparison: "increase" | "decrease";
};

async function performScrollCheck(
  page: Page,
  { direction, scrollDelta, comparison }: ScrollOptions,
) {
  const props: ScenarioProps = getData().scenarioProps;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({ ...props, scrollDirection: direction })}`,
  );
  await page.waitForTimeout(300);

  const indexesBefore = await getItemsArray(page);
  expectIndexesToBeValid(indexesBefore);

  const container = await getContainer(page);
  await easeOutScroll(await scrollDelta(container), container);

  const indexesAfter = await getItemsArray(page);
  expectIndexesToBeValid(indexesAfter);

  if (comparison === "increase") {
    expect(indexesAfter[0]).toBeGreaterThan(indexesBefore[0]);
  } else {
    expect(indexesAfter[0]).toBeLessThan(indexesBefore[0]);
  }
}

test("Scrolling up should result in a scroll reset where item indexes decrease", async ({
  page,
}) => {
  await performScrollCheck(page, {
    direction: "vertical",
    scrollDelta: async (c) => [
      0,
      -1 * (await c.evaluate((el: HTMLElement) => el.scrollHeight)),
    ],
    comparison: "decrease",
  });
});

test("Scrolling down should result in a scroll reset where item indexes increase", async ({
  page,
}) => {
  await performScrollCheck(page, {
    direction: "vertical",
    scrollDelta: async (c) => [
      0,
      await c.evaluate((el: HTMLElement) => el.scrollHeight),
    ],
    comparison: "increase",
  });
});

test("Scrolling to the right should result in a scroll reset where item indexes increase", async ({
  page,
}) => {
  await performScrollCheck(page, {
    direction: "horizontal",
    scrollDelta: async (c) => [
      await c.evaluate((el: HTMLElement) => el.scrollWidth),
      0,
    ],
    comparison: "increase",
  });
});

test("Scrolling to the left should result in a scroll reset where item indexes decrease", async ({
  page,
}) => {
  await performScrollCheck(page, {
    direction: "horizontal",
    scrollDelta: async (c) => [
      -1 * (await c.evaluate((el: HTMLElement) => el.scrollWidth)),
      0,
    ],
    comparison: "decrease",
  });
});
