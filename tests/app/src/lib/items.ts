export function getMinItemSize(
  minItemSize: number | number[],
  index: number,
): number {
  if (typeof minItemSize === "number") {
    return minItemSize;
  } else if (Array.isArray(minItemSize)) {
    return minItemSize[Math.abs(index) % minItemSize.length];
  } else {
    throw new Error(`Invalid minItemSize type: ${typeof minItemSize}`);
  }
}
