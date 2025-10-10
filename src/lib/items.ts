import { Items, itemRangeKeys } from "../types/items";
import { NonNegativeReal } from "../types/number/non-negative-real";
import { Scroll } from "../types/scroll";
import { Integer } from "../types/number/integer";
import { NonNegativeInteger } from "../types/number/non-negative-integer";
import { RangeScaledSizes } from "../types/range-scaled-sizes";
import { asItems } from "../validation/items";
import { asNonNegativeReal } from "../validation/number/non-negative-real";
import { asInteger } from "../validation/number/integer";
import { asNonNegativeInteger } from "../validation/number/non-negative-integer";
import { UseProceduralScrollerProps } from "../types/hooks/use-procedural-scroller";
import { asRangeScaledSizes } from "../validation/range-scaled-sizes";
import { asScroll } from "../validation/scroll";
import { ProceduralScrollerError } from "./error";

function throwIndexLimitDistanceError(minIndex: Integer, maxIndex: Integer) {
  throw new ProceduralScrollerError(
    "Invalid configuration: the specified minIndex and maxIndex are too close together. There isn’t enough room between them to render the required items.",
    { minIndex, maxIndex },
  );
}

function indexesExceedLimits(
  minIndexLimit: Integer | null,
  maxIndexLimit: Integer | null,
  minIndex: Integer,
  maxIndex: Integer,
):
  | {
      minLimitExceeded: true;
      maxLimitExceeded: false;
    }
  | {
      minLimitExceeded: false;
      maxLimitExceeded: true;
    }
  | {
      minLimitExceeded: false;
      maxLimitExceeded: false;
    } {
  const minLimitExceeded =
    typeof minIndexLimit === "number" && minIndex < minIndexLimit;
  const maxLimitExceeded =
    typeof maxIndexLimit === "number" && maxIndex > maxIndexLimit;
  if (minLimitExceeded && maxLimitExceeded)
    throwIndexLimitDistanceError(minIndex, maxIndex);
  if (minLimitExceeded)
    return { minLimitExceeded: true, maxLimitExceeded: false };
  if (maxLimitExceeded)
    return { minLimitExceeded: false, maxLimitExceeded: true };
  return { minLimitExceeded: false, maxLimitExceeded: false };
}

export function getItems(
  containerSize: NonNegativeReal,
  rangeScaledSizes: RangeScaledSizes,
  scroll: Scroll,
  getMinItemSize: UseProceduralScrollerProps["getMinItemSize"],
  minIndex: Integer | null = null,
  maxIndex: Integer | null = null,
): Items {
  asNonNegativeReal(containerSize);
  asRangeScaledSizes(rangeScaledSizes);
  asScroll(scroll);

  // Get index arrays:
  let contentIndexes: Integer[] = [];
  if (scroll.block === "start") {
    contentIndexes = getRangeIndexes(
      rangeScaledSizes["content"],
      scroll.index,
      1,
      containerSize,
      getMinItemSize,
    );
  } else if (scroll.block === "end") {
    contentIndexes = getRangeIndexes(
      rangeScaledSizes["content"],
      scroll.index,
      -1,
      containerSize,
      getMinItemSize,
    );
  } else if (scroll.block === "center") {
    contentIndexes = [
      ...getRangeIndexes(
        asNonNegativeReal(rangeScaledSizes["content"] * 0.5),
        asInteger(scroll.index - 1),
        -1,
        containerSize,
        getMinItemSize,
      ),
      scroll.index,
      ...getRangeIndexes(
        asNonNegativeReal(rangeScaledSizes["content"] * 0.5),
        asInteger(scroll.index + 1),
        1,
        containerSize,
        getMinItemSize,
      ),
    ];
  } else {
    throw new ProceduralScrollerError(
      `Invalid: scroll.block = ${scroll.block}`,
      scroll,
    );
  }
  const startContentIndexes = getRangeIndexes(
    rangeScaledSizes["startContent"],
    asInteger(contentIndexes[0] - 1),
    -1,
    containerSize,
    getMinItemSize,
  );
  const startPaddingIndexes = getRangeIndexes(
    rangeScaledSizes["startPadding"],
    asInteger(startContentIndexes[0] - 1),
    -1,
    containerSize,
    getMinItemSize,
  );
  const endContentIndexes = getRangeIndexes(
    rangeScaledSizes["endContent"],
    asInteger(contentIndexes[contentIndexes.length - 1] + 1),
    1,
    containerSize,
    getMinItemSize,
  );
  const endPaddingIndexes = getRangeIndexes(
    rangeScaledSizes["endPadding"],
    asInteger(endContentIndexes[endContentIndexes.length - 1] + 1),
    1,
    containerSize,
    getMinItemSize,
  );
  const { minLimitExceeded, maxLimitExceeded } = indexesExceedLimits(
    minIndex,
    maxIndex,
    startPaddingIndexes[0],
    endPaddingIndexes[endPaddingIndexes.length - 1],
  );
  if (minLimitExceeded) {
    const minLimitHitItems = asItems(
      orderedRangeIndexesToItems(
        getIndexLimitItems(
          containerSize,
          rangeScaledSizes,
          getMinItemSize,
          asInteger(Number(minIndex)),
          1,
        ),
      ),
    );
    const { minLimitExceeded, maxLimitExceeded } = indexesExceedLimits(
      minIndex,
      maxIndex,
      minLimitHitItems.indexes[0],
      minLimitHitItems.indexes[minLimitHitItems.indexes.length - 1],
    );
    if (minLimitExceeded || maxLimitExceeded) {
      throwIndexLimitDistanceError(
        asInteger(Number(minIndex)),
        asInteger(Number(maxIndex)),
      );
    }
    return minLimitHitItems;
  }
  if (maxLimitExceeded) {
    const maxLimitHitItems = asItems(
      orderedRangeIndexesToItems(
        getIndexLimitItems(
          containerSize,
          rangeScaledSizes,
          getMinItemSize,
          asInteger(Number(maxIndex)),
          -1,
        ),
      ),
    );
    const { minLimitExceeded, maxLimitExceeded } = indexesExceedLimits(
      minIndex,
      maxIndex,
      maxLimitHitItems.indexes[0],
      maxLimitHitItems.indexes[maxLimitHitItems.indexes.length - 1],
    );
    if (minLimitExceeded || maxLimitExceeded) {
      throwIndexLimitDistanceError(
        asInteger(Number(minIndex)),
        asInteger(Number(maxIndex)),
      );
    }
    return maxLimitHitItems;
  }
  return asItems(
    orderedRangeIndexesToItems([
      startPaddingIndexes,
      startContentIndexes,
      contentIndexes,
      endContentIndexes,
      endPaddingIndexes,
    ]),
  );
}

export function itemsAreEqual(itemsA: Items, itemsB: Items): boolean {
  asItems(itemsA);
  asItems(itemsB);
  // Check indexes array
  if (itemsA.indexes.length !== itemsB.indexes.length) {
    return false;
  }
  for (let i = 0; i < itemsA.indexes.length; i++) {
    if (itemsA.indexes[i] !== itemsB.indexes[i]) {
      return false;
    }
  }
  // Check rangePointers object
  if (
    Object.keys(itemsA.rangePointers).length !==
    Object.keys(itemsB.rangePointers).length
  ) {
    return false;
  }
  for (const pointer of Object.keys(
    itemsA.rangePointers,
  ) as (keyof typeof itemsA.rangePointers)[]) {
    if (
      itemsA.rangePointers[pointer].length !==
      itemsB.rangePointers[pointer].length
    ) {
      return false;
    }
    for (let i = 0; i < itemsA.rangePointers[pointer].length; i++) {
      if (
        itemsA.rangePointers[pointer][i] !== itemsB.rangePointers[pointer][i]
      ) {
        return false;
      }
    }
  }
  return true;
}

function getRangeIndexes(
  targetScaledHeight: NonNegativeReal,
  startIndex: Integer,
  increment: 1 | -1,
  containerSize: NonNegativeReal,
  getMinItemSize: UseProceduralScrollerProps["getMinItemSize"],
): Integer[] {
  asNonNegativeReal(targetScaledHeight);
  asInteger(startIndex);
  if (increment !== 1 && increment !== -1) {
    throw new ProceduralScrollerError(`Invalid increment: ${increment}`, {
      increment,
    });
  }
  asNonNegativeReal(containerSize);

  const targetHeight: NonNegativeReal = asNonNegativeReal(
    targetScaledHeight * containerSize,
  );
  const indexes = [startIndex];
  let totalHeight: NonNegativeReal = asNonNegativeReal(0);
  while (totalHeight < targetHeight) {
    const newIndex = asInteger(
      indexes[increment > 0 ? indexes.length - 1 : 0] + increment,
    );
    if (increment > 0) {
      indexes.push(newIndex);
    } else {
      indexes.unshift(newIndex);
    }
    totalHeight = asNonNegativeReal(totalHeight + getMinItemSize(newIndex));
  }
  return indexes;
}

function orderedRangeIndexesToItems(orderedRangeIndexes: Integer[][]): Items {
  if (itemRangeKeys.length !== orderedRangeIndexes.length) {
    throw new ProceduralScrollerError(
      `Array length mismatch: ${itemRangeKeys.length} !== ${orderedRangeIndexes.length}`,
      { itemRangeKeys, orderedRangeIndexes },
    );
  }
  let indexes: Integer[] = [];
  orderedRangeIndexes.forEach((rangeIndexes): void => {
    indexes = [...indexes, ...rangeIndexes];
  });
  const pointers: [NonNegativeInteger, NonNegativeInteger][] = [];
  orderedRangeIndexes.forEach((rangeIndexes: Integer[]) => {
    if (pointers.length < 1) {
      pointers.push([
        asNonNegativeInteger(0),
        asNonNegativeInteger(rangeIndexes.length - 1),
      ]);
    } else {
      pointers.push([
        asNonNegativeInteger(pointers[pointers.length - 1][1] + 1),
        asNonNegativeInteger(
          pointers[pointers.length - 1][1] + rangeIndexes.length,
        ),
      ]);
    }
  });
  return asItems({
    indexes: indexes,
    rangePointers: {
      startPadding: pointers[0],
      startContent: pointers[1],
      content: pointers[2],
      endContent: pointers[3],
      endPadding: pointers[4],
    },
  });
}

function getIndexLimitItems(
  containerSize: NonNegativeReal,
  rangeScaledSizes: RangeScaledSizes,
  getMinItemSize: UseProceduralScrollerProps["getMinItemSize"],
  indexLimit: Integer,
  increment: 1 | -1,
): Integer[][] {
  const ranges =
    increment === 1 ? [...itemRangeKeys] : [...itemRangeKeys].reverse();
  let indexTracker: Integer = indexLimit;
  const result = ranges.map((range) => {
    const rangeIndexes = getRangeIndexes(
      rangeScaledSizes[range],
      indexTracker,
      increment,
      containerSize,
      getMinItemSize,
    );
    indexTracker = asInteger(
      (increment === 1
        ? rangeIndexes[rangeIndexes.length - 1]
        : rangeIndexes[0]) + increment,
    );
    return rangeIndexes;
  });
  return increment === 1 ? result : result.reverse();
}
