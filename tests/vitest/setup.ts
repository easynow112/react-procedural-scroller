// @ts-expect-error: jsdom has types for ResizeObserver but no runtime implementation.
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserver;
