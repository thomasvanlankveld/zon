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
  const numberOfArcs = () => 1;

  const canvasSize = () => size();
  const circleSize = createMemo(() => size() * (props.factor ?? 1));

  const maxRadius = createMemo(() => circleSize() / 2);
  const outerRadius = maxRadius;
  const innerRadius = createMemo(() => outerRadius() / 2);

  const thickness = createMemo(() => outerRadius() - innerRadius());

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

  const d = () => {
    const firstMove = `M 0 ${-outerRadius()}`;
    const outerHalfArc = `${outerRadius()} ${outerRadius()} 0 0 1 0`;
    const outerArc = `a ${outerHalfArc} ${2 * outerRadius()} ${outerHalfArc} ${-2 * outerRadius()}`;
    const moveToInner = `v ${thickness()}`;
    const innerHalfArc = `${outerRadius() - thickness()} ${outerRadius() - thickness()} 0 0 0 0`;
    const innerArc = `a ${innerHalfArc} ${2 * (outerRadius() - thickness())} ${innerHalfArc} ${-2 * (outerRadius() - thickness())}`;

    return `${firstMove} ${outerArc} ${moveToInner} ${innerArc}`;
  };

  return (
    <svg
      viewBox={`${-0.5 * canvasSize()} ${-0.5 * canvasSize()} ${canvasSize()} ${canvasSize()}`}
      width={canvasSize()}
      height={canvasSize()}
      ref={props.setSvg}
    >
      {/* <path d={arc.d} fill={arc.color} fill-rule="evenodd" /> */}

      <clipPath id="clip">
        <path d={d()} />
        {/* <path d="M 50 0 a 50 50 0 0 1 0 100 50 50 0 0 1 0 -100 v 8 a 42 42 0 0 0 0 84 42 42 0 0 0 0 -84" /> */}
        {/* <path d={arc.d} /> */}
        {/* <path d={arc2.d} /> */}
      </clipPath>

      <foreignObject
        x={-0.5 * canvasSize()}
        y={-0.5 * canvasSize()}
        width={canvasSize()}
        height={canvasSize()}
        clip-path="url(#clip)"
      >
        <div
          style={{
            width: `${canvasSize()}px`,
            height: `${canvasSize()}px`,
            // "border-radius": `${canvasSize() / 2}px`,
            // "clip-path": `path('${arc.d}')`,
            // "fill-rule": "evenodd",
            background: "conic-gradient(red, orange, yellow, green, blue)",
          }}
          xmlns="http://www.w3.org/1999/xhtml"
        />
      </foreignObject>
    </svg>
  );
}
