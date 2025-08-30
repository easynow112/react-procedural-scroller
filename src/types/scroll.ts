import { Integer } from "./number/integer";

export const scrollBlocks = ["start", "center", "end"] as const;

export type Scroll = {
  block: (typeof scrollBlocks)[number];
  index: Integer;
};
