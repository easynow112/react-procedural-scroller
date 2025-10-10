import { expect, Locator, Page } from "@playwright/test";

export async function getContainer(page: Page): Promise<Locator> {
  const containers = page.getByTestId("container");
  await expect(containers).toHaveCount(1);
  return containers.first();
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

export async function getComputedStyle(item: Locator) {
  return await item.evaluate((item) => {
    const style = window.getComputedStyle(item);
    return {
      marginTop: parseFloat(style.marginTop || "0"),
      marginBottom: parseFloat(style.marginBottom || "0"),
      marginLeft: parseFloat(style.marginLeft || "0"),
      marginRight: parseFloat(style.marginRight || "0"),
      paddingTop: parseFloat(style.paddingTop || "0"),
      paddingBottom: parseFloat(style.paddingBottom || "0"),
      paddingLeft: parseFloat(style.paddingLeft || "0"),
      paddingRight: parseFloat(style.paddingRight || "0"),
      borderTopWidth: parseFloat(style.borderTopWidth || "0"),
      borderBottomWidth: parseFloat(style.borderBottomWidth || "0"),
      borderLeftWidth: parseFloat(style.borderLeftWidth || "0"),
      borderRightWidth: parseFloat(style.borderRightWidth || "0"),
    };
  });
}
