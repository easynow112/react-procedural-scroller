import { expect, type Locator, type Page } from "@playwright/test";
import { BoundingBox } from "../types/bounding-box";
import { getDocumentRelativeBoundingBox } from "./dimensions";

export async function easeOutScroll(
  distance: [number, number],
  locator: Locator,
): Promise<void> {
  await locator.evaluate((element, distance) => {
    return new Promise<void>((resolve) => {
      const startTime = performance.now();
      const targetFPS = 30;
      const totalDistance = Math.sqrt(distance[0] ** 2 + distance[1] ** 2);
      const totalTime = totalDistance / 3;
      let prevNormalisedScrollProgress = 0;
      function incrementScroll() {
        const elapsedTime = performance.now() - startTime;
        const normalisedElapsedTime = elapsedTime / totalTime;
        const normalisedScrollProgress = 1 - (1 - normalisedElapsedTime) ** 3;
        if (normalisedScrollProgress >= 1) {
          resolve();
          return;
        }
        const diff = normalisedScrollProgress - prevNormalisedScrollProgress;
        prevNormalisedScrollProgress = normalisedScrollProgress;
        element.scrollBy(diff * distance[0], diff * distance[1]);
        setTimeout(incrementScroll, 1000 / targetFPS);
      }
      incrementScroll();
    });
  }, distance);
}

export async function checkScrollPosition(
  page: Page,
  element: Locator,
  block: "start" | "end" | "center",
) {
  const boxBefore = await getDocumentRelativeBoundingBox(element);
  expect(boxBefore).not.toBe(null);

  // Scroll into view with the specified alignment
  await element.evaluate((element, block) => {
    element.scrollIntoView({
      behavior: "instant",
      block,
    });
  }, block);
  await page.waitForTimeout(300);

  const boxAfter = await getDocumentRelativeBoundingBox(element);
  expect(boxAfter).not.toBe(null);

  // Check that the position hasn't changed significantly
  const delta = Math.sqrt(
    (boxBefore.x - boxAfter.x) ** 2 + (boxBefore.y - boxAfter.y) ** 2,
  );
  expect(delta).toBeLessThan(5);
}
