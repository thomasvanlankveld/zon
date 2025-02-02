import { For } from "solid-js";
import { getArcD } from "../utils/svg";
import { rainbow } from "../utils/zon";

export type Dimensions = {
  x0: number;
  x1: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

type LogoProps = {
  size?: number;
  numberOfArcs?: number;
};

export default function Logo(props: LogoProps) {
  const size = () => props.size ?? 38;
  const numberOfArcs = () => props.numberOfArcs ?? size() * 2;

  const strokeWidth = 1;
  const maxRadius = () => size() / 2 - strokeWidth;
  const outerRadius = maxRadius;
  const innerRadius = () => outerRadius() / 2 + strokeWidth;

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

  const arcs = () =>
    Array.from({ length: numberOfArcs() })
      .fill(null)
      .map((_, i) => {
        const position = getPosition(i);
        const dimensions = getArcDimensions(position);
        const d = getLogoArcD(dimensions);

        const color = rainbow(position).regular;

        return { d, color };
      });

  return (
    <svg
      viewBox={`${-0.5 * size()} ${-0.5 * size()} ${size()} ${size()}`}
      width={size()}
      height={size()}
    >
      <For each={arcs()}>
        {(arc) => (
          <path
            d={arc.d}
            fill={arc.color}
            stroke={arc.color}
            stroke-width={strokeWidth}
          />
        )}
      </For>
    </svg>
  );
}
