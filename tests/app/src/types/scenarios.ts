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
  containerBox?: {
    height: number;
    width: number;
    padding: string | number;
    margin: string | number;
    border: string;
  };
  itemBox?: {
    padding: string | number;
    margin: string | number;
    border: string;
  };
  wrapperBox?: {
    padding: string | number;
    margin: string | number;
  };
  validateLayouts?: {
    container?: boolean;
    items?: boolean;
  };
};
