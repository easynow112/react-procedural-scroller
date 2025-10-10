import { expect, Page, test } from "@playwright/test";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { ScenarioProps } from "../../app/src/types/scenarios";

async function runTest(page: Page, direction: "vertical" | "horizontal") {
  const props: ScenarioProps = getData().scenarioProps;
  const errorPromise = page.waitForEvent("pageerror");
  await page.goto(
    `/unbounded-container-size?props=${urlEncodeObject({ ...props, scrollDirection: direction })}`,
  );
  const error = await errorPromise;
  expect(error.message).toContain("Unbounded container detected:");
}

test("In vertical scrolling mode, when the container height is unbounded, the page should error", async ({
  page,
}) => {
  await runTest(page, "vertical");
});

test("In horizontal scrolling mode, when the container width is unbounded, the page should error", async ({
  page,
}) => {
  await runTest(page, "horizontal");
});
