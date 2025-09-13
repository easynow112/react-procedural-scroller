import { expect, test, Page } from "@playwright/test";
import { getContainer, getItemsArray } from "../lib/locators";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { ScenarioProps } from "../../app/src/types/scenarios";
import { BoundingBox } from "../types/bounding-box";

async function testScrollDirection(page: Page, direction: "vertical" | "horizontal") {
  const props: ScenarioProps = getData().scenarioProps;

  await page.goto(
    `/date-scroller?props=${urlEncodeObject({
      ...props,
      scrollDirection: direction,
    })}`,
  );
  await page.waitForTimeout(300);

  const container = await getContainer(page);
  const itemsBefore = await getItemsArray(page);
  const boxBefore = (await container.locator.boundingBox()) as BoundingBox;
  expect(boxBefore).not.toBe(null);

  const getMinSize = (size: number) =>
    size * (props.paddingAreaScale.start + props.scrollAreaScale + props.paddingAreaScale.end);

  if (direction === "vertical") {
    expect(container.scrollHeight).toBeGreaterThanOrEqual(getMinSize(boxBefore.height));
  } else {
    expect(container.scrollWidth).toBeGreaterThanOrEqual(getMinSize(boxBefore.width));
  }

  // Double the container size
  await container.locator.evaluate((el, args) => {
    if (args.direction === "vertical") el.style.height = `${args.box.height * 2}px`;
    else el.style.width = `${args.box.width * 2}px`;
  }, { box: boxBefore, direction });

  await page.waitForTimeout(300);

  const containerAfter = await getContainer(page);
  const boxAfter = (await containerAfter.locator.boundingBox()) as BoundingBox;
  expect(boxAfter).not.toBe(null);

  const itemsAfter = await getItemsArray(page);
  expect(itemsAfter.length).toBeGreaterThan(itemsBefore.length);

  if (direction === "vertical") {
    expect(containerAfter.scrollHeight).toBeGreaterThanOrEqual(getMinSize(boxAfter.height));
  } else {
    expect(containerAfter.scrollWidth).toBeGreaterThanOrEqual(getMinSize(boxAfter.width));
  }
}

test("Container scrollHeight in vertical scrolling mode exceeds minimum and updates on resize", async ({ page }) => {
  await testScrollDirection(page, "vertical");
});

test("Container scrollWidth in horizontal scrolling mode exceeds minimum and updates on resize", async ({ page }) => {
  await testScrollDirection(page, "horizontal");
});
