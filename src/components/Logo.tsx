import { createMemo, Setter } from "solid-js";
import { rainbow } from "../utils/zon";

export type Dimensions = {
  x0: number;
  x1: number;
};

type LogoProps = {
  size?: number;
  factor?: number;
  numberOfColors?: number;
  setSvg?: Setter<SVGSVGElement | undefined>;
};

export default function Logo(props: LogoProps) {
  const size = () => props.size ?? 38;
  const numberOfColors = () => props.numberOfColors ?? 15;

  const canvasSize = () => size();
  const circleSize = createMemo(() => size() * (props.factor ?? 1));

  const maxRadius = createMemo(() => circleSize() / 2);
  const outerRadius = maxRadius;
  const innerRadius = createMemo(() => outerRadius() / 2);

  const thickness = createMemo(() => outerRadius() - innerRadius());

  const step = () => 1 / numberOfColors();

  function getPosition(i: number) {
    return i * step();
  }

  const colors = () =>
    // Add one so that the first color is the same as the last
    Array.from({ length: numberOfColors() + 1 })
      .fill(null)
      .map((_, i) => rainbow(getPosition(i)).regular);
  const conicGradient = () => `conic-gradient(${colors().join(", ")})`;

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
      <clipPath id="clip">
        <path d={d()} />
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
            // background: "conic-gradient(red, orange, yellow, green, blue)",
            background: conicGradient(),
          }}
          xmlns="http://www.w3.org/1999/xhtml"
        />
      </foreignObject>
    </svg>
  );
}
