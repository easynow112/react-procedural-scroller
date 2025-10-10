import { expect, Page, test } from "@playwright/test";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { ScenarioProps } from "../../app/src/types/scenarios";

async function runTest(page: Page, direction: "vertical" | "horizontal") {
  const props: ScenarioProps = getData().scenarioProps;
  const errorPromise = page.waitForEvent("pageerror");
  await page.goto(
    `/invalid-item-size?props=${urlEncodeObject({ ...props, scrollDirection: direction })}`,
  );
  const error = await errorPromise;
  expect(error.message).toContain("Invalid item size:");
}

test("In vertical scrolling mode, if an item is smaller than the result of getMinItemSize, an error is thrown.", async ({
  page,
}) => {
  await runTest(page, "vertical");
});

test("In horizontal scrolling mode, if an item is smaller than the result of getMinItemSize, an error is thrown.", async ({
  page,
}) => {
  await runTest(page, "horizontal");
});
