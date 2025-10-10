import { expect, test, Page } from "@playwright/test";
import { getContainer, getItemsArray } from "../lib/locators";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { ScenarioProps } from "../../app/src/types/scenarios";
import { BoundingBox } from "../types/bounding-box";

async function testScrollDirection(
  page: Page,
  direction: "vertical" | "horizontal",
) {
  // 1.) Setup
  const props: ScenarioProps = getData().scenarioProps;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({
      ...props,
      scrollDirection: direction,
    })}`,
  );
  await page.waitForTimeout(300);
  const container = await getContainer(page);
  const getMinContainerSize = (size: number) =>
    size *
    (props.paddingAreaScale.start +
      props.scrollAreaScale +
      props.paddingAreaScale.end);

  // 2.) Check that the container scrollHeight/scrollWidth exceeds the minimum expected
  const itemsBefore = await getItemsArray(page);
  const boxBefore = (await container.boundingBox()) as BoundingBox;
  expect(boxBefore).not.toBe(null);
  if (direction === "vertical") {
    expect(
      await container.evaluate((el) => el.scrollHeight),
    ).toBeGreaterThanOrEqual(getMinContainerSize(boxBefore.height));
  } else {
    expect(
      await container.evaluate((el) => el.scrollWidth),
    ).toBeGreaterThanOrEqual(getMinContainerSize(boxBefore.width));
  }

  // 3.) Double the container height/width
  await container.evaluate(
    (el, args) => {
      if (args.direction === "vertical")
        el.style.minHeight = `${args.box.height * 2}px`;
      else el.style.minWidth = `${args.box.width * 2}px`;
    },
    { box: boxBefore, direction },
  );
  await page.waitForTimeout(300);

  // 4.) Check that the container scrollHeight/scrollWidth still exceeds the minimum expected
  const boxAfter = (await container.boundingBox()) as BoundingBox;
  expect(boxAfter).not.toBe(null);
  const itemsAfter = await getItemsArray(page);
  expect(itemsAfter.length).toBeGreaterThan(itemsBefore.length);
  if (direction === "vertical") {
    expect(
      await container.evaluate((el) => el.scrollHeight),
    ).toBeGreaterThanOrEqual(getMinContainerSize(boxAfter.height));
  } else {
    expect(
      await container.evaluate((el) => el.scrollWidth),
    ).toBeGreaterThanOrEqual(getMinContainerSize(boxAfter.width));
  }
}

test("Container scrollHeight in vertical scrolling mode exceeds minimum and updates on resize", async ({
  page,
}) => {
  await testScrollDirection(page, "vertical");
});

test("Container scrollWidth in horizontal scrolling mode exceeds minimum and updates on resize", async ({
  page,
}) => {
  await testScrollDirection(page, "horizontal");
});
