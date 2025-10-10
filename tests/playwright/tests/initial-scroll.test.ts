import { expect, Page, test } from "@playwright/test";
import { getItem } from "../lib/locators";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { ScenarioProps } from "../../app/src/types/scenarios";
import { BoundingBox } from "../types/bounding-box";
import { checkScrollPosition } from "../lib/scroll";

async function testInitialScroll(
  page: Page,
  scrollDirection: "vertical" | "horizontal",
  block: "start" | "center" | "end",
) {
  // 1.) Setup
  const props: ScenarioProps = getData().scenarioProps;
  const index = props.initialScroll.index;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({
      ...props,
      scrollDirection,
      initialScroll: { index, block },
    })}`,
  );
  await page.waitForTimeout(300);

  // 2.) Check that the `initialScroll.index` item is aligned as expected within the container:
  const item = await getItem(page, index);
  await checkScrollPosition(page, item, block);
}

// Vertical scrolling
test("Vertical scroll with block='start'", async ({ page }) => {
  await testInitialScroll(page, "vertical", "start");
});

test("Vertical scroll with block='end'", async ({ page }) => {
  await testInitialScroll(page, "vertical", "end");
});

test("Vertical scroll with block='center'", async ({ page }) => {
  await testInitialScroll(page, "vertical", "center");
});

// Horizontal scrolling
test("Horizontal scroll with block='start'", async ({ page }) => {
  await testInitialScroll(page, "horizontal", "start");
});

test("Horizontal scroll with block='end'", async ({ page }) => {
  await testInitialScroll(page, "horizontal", "end");
});

test("Horizontal scroll with block='center'", async ({ page }) => {
  await testInitialScroll(page, "horizontal", "center");
});
