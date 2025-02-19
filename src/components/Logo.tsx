import { createMemo, Setter } from "solid-js";
import { conicGradient } from "../utils/zon";

export type Dimensions = {
  x0: number;
  x1: number;
};

type LogoProps = {
  size?: number;
  circleSizeRatio?: number;
  setSvg?: Setter<SVGSVGElement | undefined>;
};

export default function Logo(props: LogoProps) {
  const size = () => props.size ?? 38;

  const canvasSize = () => size();
  const circleSize = createMemo(() => size() * (props.circleSizeRatio ?? 1));

  const maxRadius = createMemo(() => circleSize() / 2);
  const outerRadius = maxRadius;
  const innerRadius = createMemo(() => outerRadius() / 2);

  const thickness = createMemo(() => outerRadius() - innerRadius());

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
      <clipPath id="logo-clip-path">
        <path d={d()} />
      </clipPath>

      <foreignObject
        x={-0.5 * canvasSize()}
        y={-0.5 * canvasSize()}
        width={canvasSize()}
        height={canvasSize()}
        clip-path="url(#logo-clip-path)"
      >
        <div
          style={{
            width: `${canvasSize()}px`,
            height: `${canvasSize()}px`,
            background: conicGradient({ numberOfColors: 20 }),
          }}
          xmlns="http://www.w3.org/1999/xhtml"
        />
      </foreignObject>
    </svg>
  );
}
