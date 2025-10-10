import { ElementHandle, Locator, Page } from "@playwright/test";

export async function getDocumentRelativeBoundingBox(
  element: Locator,
): Promise<Omit<DOMRect, "toJSON">> {
  if (!element) throw new Error("Element not found");
  return await element.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      bottom: rect.bottom + window.scrollY,
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      right: rect.right + window.scrollX,
      x: rect.x + window.scrollX,
      y: rect.y + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  });
}

export async function itemIsVisibleInContainer(
  page: Page,
  item: ElementHandle<Element>,
  container: ElementHandle<Element>,
  threshold = 0.01,
  timeoutMs = 5000,
): Promise<boolean> {
  return page.evaluate(
    async ({ threshold, timeoutMs, item, container }) => {
      return await new Promise<boolean>((resolve) => {
        const timeoutId = setTimeout(() => {
          observer.disconnect();
          resolve(false);
        }, timeoutMs);
        const observer = new IntersectionObserver(
          (entries, obs) => {
            const entry = entries[0];
            obs.disconnect();
            clearTimeout(timeoutId);
            resolve(entry.isIntersecting);
          },
          { root: container, threshold },
        );
        observer.observe(item);
      });
    },
    { threshold, timeoutMs, item, container },
  );
}
