export const dimensionKeys = [
  "containerAxis",
  "scrollLength",
  "itemOffset",
] as const;

export type Dimension = (typeof dimensionKeys)[number];

type DimensionsOption<T extends Record<Dimension, string>> = T;

export type Dimensions =
  | DimensionsOption<{
      containerAxis: "clientHeight";
      scrollLength: "scrollTop";
      itemOffset: "offsetTop";
    }>
  | DimensionsOption<{
      containerAxis: "clientWidth";
      scrollLength: "scrollLeft";
      itemOffset: "offsetLeft";
    }>;
