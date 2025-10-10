import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/vitest/tests/**/*.test.{tsx, ts}"],
    environment: "jsdom",
    globals: true,
    setupFiles: "tests/vitest/setup.ts",
  },
});
