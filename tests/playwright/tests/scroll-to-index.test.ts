import { Page, test } from "@playwright/test";
import { getData } from "../../data/data";
import { urlEncodeObject } from "../lib/url";
import { getContainer, getItem } from "../lib/locators";
import { checkScrollPosition, easeOutScroll } from "../lib/scroll";
import { ScenarioProps } from "../../app/src/types/scenarios";

async function runScrollTest(
  page: Page,
  scrollDirection: "vertical" | "horizontal",
) {
  // 1.) Setup
  const data = getData();
  const props: ScenarioProps = data.scenarioProps;
  await page.goto(
    `/date-scroller?props=${urlEncodeObject({
      ...props,
      scrollDirection,
    })}`,
  );
  await page.waitForTimeout(2000);
  const container = await getContainer(page);

  // 2.) Scroll away from the initial scroll
  if (scrollDirection === "vertical") {
    await easeOutScroll(
      [
        0,
        data.randomDirection *
          (await container.evaluate((el) => el.scrollHeight)),
      ],
      container,
    );
  } else {
    await easeOutScroll(
      [
        data.randomDirection *
          (await container.evaluate((el) => el.scrollWidth)),
        0,
      ],
      container,
    );
  }

  // 3.) Click the `scrollToIndexButton` which executes `scrollToIndex`
  await page.getByTestId("scrollToIndexButton").click({ force: true });
  await page.waitForTimeout(3000);

  // 4.) Check that container has scrolled back to `initialScroll`
  const item = await getItem(page, props.initialScroll.index);
  await checkScrollPosition(page, item, props.initialScroll.block);
}

test("In vertical scrolling mode, scrollToIndex resets scroll position with alignment", async ({
  page,
}) => {
  await runScrollTest(page, "vertical");
});

test("In horizontal scrolling mode, scrollToIndex resets scroll position with alignment", async ({
  page,
}) => {
  await runScrollTest(page, "horizontal");
});
