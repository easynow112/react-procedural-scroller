import { expect, Page, test } from "@playwright/test";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { getContainer, getItem } from "../lib/locators";
import { easeOutScroll } from "../lib/scroll";
import { ScenarioProps } from "../../app/src/types/scenarios";

async function getBoundingBoxes(page: Page, initialScrollIndex: number) {
  const item = await getItem(page, initialScrollIndex);
  const itemBox = await item.boundingBox();
  const containerBox = await (await getContainer(page)).locator.boundingBox();
  if (!itemBox || !containerBox) {
    throw new Error("Could not find item/container bounding boxes");
  }
  return { itemBox, containerBox };
}

test("In vertical scrolling mode, the scrollToIndex function should reset the scroll position to an arbitrary index + alignment", async ({
  page,
}) => {
  const data = getData();
  const props: ScenarioProps = data.scenarioProps;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({
      ...props,
      scrollDirection: "vertical",
    })}`,
  );
  await page.waitForTimeout(2000);
  const container = await getContainer(page);
  await easeOutScroll(
    [0, data.randomDirection * container.scrollHeight],
    container.locator,
  );
  await page.getByTestId("scrollToIndexButton").click();
  await page.waitForTimeout(1500);
  const { itemBox, containerBox } = await getBoundingBoxes(
    page,
    props.initialScroll.index,
  );
  if (props.initialScroll.block === "start") {
    expect(Math.abs(itemBox.y - containerBox.y)).toBeLessThan(5);
  } else if (props.initialScroll.block === "end") {
    expect(
      Math.abs(
        itemBox.y + itemBox.height - (containerBox.y + containerBox.height),
      ),
    ).toBeLessThan(5);
  } else if (props.initialScroll.block === "center") {
    const itemCenter = (itemBox.y + (itemBox.y + itemBox.height)) / 2;
    const containerCenter =
      (containerBox.y + (containerBox.y + containerBox.height)) / 2;
    expect(Math.abs(itemCenter - containerCenter)).toBeLessThan(5);
  } else {
    throw new Error("Invalid initialScroll block");
  }
});

test("In horizontal scrolling mode, the scrollToIndex function should reset the scroll position to an arbitrary index + alignment", async ({
  page,
}) => {
  const data = getData();
  const props: ScenarioProps = data.scenarioProps;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({
      ...props,
      scrollDirection: "horizontal",
    })}`,
  );
  await page.waitForTimeout(2000);
  const container = await getContainer(page);
  await easeOutScroll(
    [data.randomDirection * container.scrollWidth, 0],
    container.locator,
  );
  await page.getByTestId("scrollToIndexButton").click();
  await page.waitForTimeout(1500);
  const { itemBox, containerBox } = await getBoundingBoxes(
    page,
    props.initialScroll.index,
  );
  if (props.initialScroll.block === "start") {
    expect(Math.abs(itemBox.x - containerBox.x)).toBeLessThan(5);
  } else if (props.initialScroll.block === "end") {
    expect(
      Math.abs(
        itemBox.x + itemBox.width - (containerBox.x + containerBox.width),
      ),
    ).toBeLessThan(5);
  } else if (props.initialScroll.block === "center") {
    const itemCenter = (itemBox.x + (itemBox.x + itemBox.width)) / 2;
    const containerCenter =
      (containerBox.x + (containerBox.x + containerBox.width)) / 2;
    expect(Math.abs(itemCenter - containerCenter)).toBeLessThan(5);
  } else {
    throw new Error("Invalid initialScroll block");
  }
});
