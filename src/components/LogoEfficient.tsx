//
// THIS DIV APPROACH DOES NOT WORK
//
// conic-gradient does not work with SVG
// Maybe it'd be possible to do something with SVG filters, but:
// - I'd have to make the filter
// - I'd have to check if it works with oklch
// - If it doesn't, I'd have to convert oklch to rgb
//

import { createMemo, Setter } from "solid-js";
import { getArcD } from "../utils/svg";
import { rainbow } from "../utils/zon";

export type Dimensions = {
  x0: number;
  x1: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

type LogoEfficientProps = {
  size?: number;
  factor?: number;
  numberOfArcs?: number;
  setSvg?: Setter<SVGSVGElement | undefined>;
};

export default function LogoEfficient(props: LogoEfficientProps) {
  const size = () => props.size ?? 38;
  // const nFactor = 2;
  //   const nFactor = 1;
  //   const numberOfArcs = () => props.numberOfArcs ?? size() * nFactor;
  const numberOfArcs = () => 2;

  const canvasSize = () => size();
  const circleSize = createMemo(() => size() * (props.factor ?? 1));

  const maxRadius = () => circleSize() / 2;
  const outerRadius = maxRadius;
  const innerRadius = () => outerRadius() / 2;

  const step = () => 1 / numberOfArcs();

  function getPosition(i: number) {
    return i * step();
  }

  /**
   * Determines the dimensions of an arc
   * The dimensions are returned in a range of 0-1
   */
  function getArcDimensions(position: number): Dimensions {
    const x0 = position;
    const x1 = position + step();

    return { x0: clamp(x0, 0, 1), x1: clamp(x1, 0, 1) };
  }

  /**
   * Determines the SVG path data for a node's arc
   */
  function getLogoArcD(dimensions: Dimensions): string {
    const startAngle = dimensions.x0 * 2 * Math.PI;
    const endAngle = dimensions.x1 * 2 * Math.PI;

    return getArcD({
      innerRadius: innerRadius(),
      outerRadius: outerRadius(),
      startAngle,
      endAngle,
    });
  }

  const arc = (() => {
    const position = getPosition(0);
    const dimensions = getArcDimensions(0);
    const d = getLogoArcD(dimensions);

    const color = rainbow(position).regular;

    return { d, color };
  })();
  const arc2 = (() => {
    const position = getPosition(0.5);
    const dimensions = getArcDimensions(0.5);
    const d = getLogoArcD(dimensions);

    const color = rainbow(position).regular;

    return { d, color };
  })();

  return (
    <div
      style={{
        width: `${canvasSize()}px`,
        height: `${canvasSize()}px`,
        // "border-radius": `${canvasSize() / 2}px`,
        "clip-path": `path('${arc.d}')`,
        "fill-rule": "evenodd",
        background: "conic-gradient(red, orange, yellow, green, blue)",
      }}
    />
  );
}
