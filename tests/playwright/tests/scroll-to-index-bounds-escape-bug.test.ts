import { expect, Page, test } from "@playwright/test";
import { getData } from "../../data/data";
import { ScenarioProps } from "../../app/src/types/scenarios";
import { urlEncodeObject } from "../lib/url";
import { getContainer } from "../lib/locators";
import { easeOutScroll } from "../lib/scroll";

async function runTest(page: Page, scrollDirection: "vertical" | "horizontal") {
  // 1.) Setup
  const data = getData();
  const props: ScenarioProps = data.scenarioProps;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({
      ...props,
      scrollDirection,
    })}`,
  );
  await page.waitForTimeout(300);
  const container = await getContainer(page);

  // 2.) Add an event listener to store the minimum container scroll position on the window
  await container.evaluate((element, scrollDirection) => {
    element.addEventListener("scroll", () => {
      const typedWindow = window as typeof window & {
        _minScrollPosition: number;
      };
      const currentScroll =
        scrollDirection === "horizontal"
          ? element.scrollLeft
          : element.scrollTop;
      if (
        typeof typedWindow._minScrollPosition !== "number" ||
        currentScroll < typedWindow._minScrollPosition
      ) {
        typedWindow._minScrollPosition = currentScroll;
      }
    });
  }, scrollDirection);

  // 3.) Click the `scrollToIndexButton` (since the container is already at the initial scroll position this results in no scrolling and could result in corrupted state)
  await page.getByTestId("scrollToIndexButton").click({ force: true });
  await page.waitForTimeout(300);

  // 4.) Attempt to scroll past the minimum bound
  if (scrollDirection === "vertical") {
    await easeOutScroll(
      [0, -2 * (await container.evaluate((el) => el.scrollHeight))],
      container,
    );
  } else {
    await easeOutScroll(
      [-2 * (await container.evaluate((el) => el.scrollWidth)), 0],
      container,
    );
  }

  // 5 .) Check that the scroll position never reached zero
  const minScroll = await page.evaluate(
    () =>
      (window as typeof window & { _minScrollPosition: number })
        ._minScrollPosition,
  );
  expect(minScroll).toBeGreaterThan(0);
}

test("Bugfix: In vertical scrolling mode, scrollToIndex calls that don’t require scrolling no longer corrupt the internal state, ensuring scroll bounds are preserved.", async ({
  page,
}) => {
  await runTest(page, "vertical");
});

test("Bugfix: In horizontal scrolling mode, scrollToIndex calls that don’t require scrolling no longer corrupt the internal state, ensuring scroll bounds are preserved.", async ({
  page,
}) => {
  await runTest(page, "horizontal");
});
