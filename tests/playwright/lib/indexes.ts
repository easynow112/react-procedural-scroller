import { expect } from "@playwright/test";

export function expectIndexesToBeValid(input: number[]) {
  expect(Array.isArray(input)).toBe(true);
  for (let i = 0; i < input.length; i++) {
    expect(typeof input[i]).toBe("number");
    expect(Number.isInteger(input[i])).toBe(true);
    expect(!isNaN(input[i])).toBe(true);
    expect(isFinite(input[i])).toBe(true);
    if (typeof input[i - 1] === "number") {
      expect(input[i - 1]).toBe(input[i] - 1);
    }
  }
}
