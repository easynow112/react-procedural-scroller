export type ScenarioProps = {
  initialScroll: {
    block: "start" | "center" | "end";
    index: number;
  };
  minItemSize: number | number[];
  scrollAreaScale: number;
  minIndex?: number;
  maxIndex?: number;
  paddingAreaScale: {
    start: number;
    end: number;
  };
  scrollDirection?: "vertical" | "horizontal";
  containerDimensions?: {
    height: number;
    width: number;
  };
};
