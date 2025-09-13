import { expect, Locator, Page } from "@playwright/test";

export async function getContainer(page: Page): Promise<{
  locator: Locator;
  scrollHeight: number;
  scrollWidth: number;
}> {
  const containers = page.getByTestId("container");
  await expect(containers).toHaveCount(1);
  return {
    locator: containers.first(),
    scrollHeight: await containers.first().evaluate((el) => el.scrollHeight),
    scrollWidth: await containers.first().evaluate((el) => el.scrollWidth),
  };
}

export async function getItems(page: Page): Promise<Locator> {
  return page.locator('[data-testid^="item-"]');
}

export async function getItem(page: Page, index: number): Promise<Locator> {
  const items = page.getByTestId(`item-${index}`);
  await expect(items).toHaveCount(1);
  return items.first();
}

export async function getItemsArray(page: Page): Promise<number[]> {
  const items = await getItems(page); // async fetch
  return await items.evaluateAll((elements) =>
    elements
      .map((el) => {
        const testId = el.getAttribute("data-testid");
        if (!testId) return null;
        const num = Number(testId.replace("item-", ""));
        return Number.isInteger(num) && isFinite(num) ? num : null;
      })
      .filter((n): n is number => n !== null),
  );
}
