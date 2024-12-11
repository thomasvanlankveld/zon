import { Setter, Accessor } from "solid-js";
import { Node } from "../../../utils/zon";

export type DimensionKey = "x0" | "x1" | "y0" | "y1";
export type Dimensions = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

export type SunburstNode = Node & {
  opacity: Accessor<number>;
  setOpacity: Setter<number>;
  targetOpacity: Accessor<number>;
  setTargetOpacity: Setter<number>;
  dimensions: Accessor<Dimensions>;
  setDimensions: Setter<Dimensions>;
  targetDimensions: Accessor<Dimensions>;
  setTargetDimensions: Setter<Dimensions>;
};
