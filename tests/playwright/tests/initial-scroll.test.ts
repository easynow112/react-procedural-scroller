import { expect, Page, test } from "@playwright/test";
import { getContainer, getItem } from "../lib/locators";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { ScenarioProps } from "../../app/src/types/scenarios";
import { BoundingBox } from "../types/bounding-box";

async function getBoundingBoxes(page: Page, itemIndex: number) {
  const itemBox = await (await getItem(page, itemIndex)).boundingBox();
  const containerBox = await (await getContainer(page)).locator.boundingBox();
  expect(itemBox).not.toBe(null);
  expect(containerBox).not.toBe(null);
  return {
    itemBox: itemBox as BoundingBox,
    containerBox: containerBox as BoundingBox,
  };
}

async function testInitialScroll(
  page: Page,
  scrollDirection: "vertical" | "horizontal",
  block: "start" | "center" | "end"
) {
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

  const { itemBox, containerBox } = await getBoundingBoxes(page, index);

  let diff: number;
  if (scrollDirection === "vertical") {
    if (block === "start") diff = Math.abs(itemBox.y - containerBox.y);
    else if (block === "end")
      diff = Math.abs(containerBox.y + containerBox.height - (itemBox.y + itemBox.height));
    else // center
      diff = Math.abs(containerBox.y + containerBox.height / 2 - (itemBox.y + itemBox.height / 2));
  } else {
    if (block === "start") diff = Math.abs(itemBox.x - containerBox.x);
    else if (block === "end")
      diff = Math.abs(containerBox.x + containerBox.width - (itemBox.x + itemBox.width));
    else // center
      diff = Math.abs(containerBox.x + containerBox.width / 2 - (itemBox.x + itemBox.width / 2));
  }

  expect(diff).toBeLessThan(5);
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
