import { Integer } from "./integer";

export type NonNegativeInteger = Integer & { __nonNegative: true };
