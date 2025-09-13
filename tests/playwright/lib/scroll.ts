import type { Locator } from "@playwright/test";

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
