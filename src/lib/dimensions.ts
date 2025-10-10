type Axis = "horizontal" | "vertical";

interface SizeOptions {
  includePadding?: boolean;
  includeBorder?: boolean;
  includeMargin?: boolean;
}

export function getElementSize(
  element: HTMLElement,
  axis: Axis,
  options: SizeOptions = {},
): number {
  const {
    includePadding = true,
    includeBorder = false,
    includeMargin = false,
  } = options;

  const isHorizontal = axis === "horizontal";

  const style = window.getComputedStyle(element);

  let size: number;

  // Start with content size (clientWidth/clientHeight includes padding)
  size = isHorizontal ? element.clientWidth : element.clientHeight;

  // Remove padding if not included
  if (!includePadding) {
    const paddingStart = parseFloat(
      isHorizontal ? style.paddingLeft : style.paddingTop,
    );
    const paddingEnd = parseFloat(
      isHorizontal ? style.paddingRight : style.paddingBottom,
    );
    size -= paddingStart + paddingEnd;
  }

  // Add border if included
  if (includeBorder) {
    const borderStart = parseFloat(
      isHorizontal ? style.borderLeftWidth : style.borderTopWidth,
    );
    const borderEnd = parseFloat(
      isHorizontal ? style.borderRightWidth : style.borderBottomWidth,
    );
    size += borderStart + borderEnd;
  }

  // Add margin if included
  if (includeMargin) {
    const marginStart = parseFloat(
      isHorizontal ? style.marginLeft : style.marginTop,
    );
    const marginEnd = parseFloat(
      isHorizontal ? style.marginRight : style.marginBottom,
    );
    size += marginStart + marginEnd;
  }

  return size;
}
