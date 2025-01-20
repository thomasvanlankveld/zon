import { JSX } from "solid-js/h/jsx-runtime";
import { getArcD } from "../../../utils/svg.ts";
import { SunburstNode } from "./types.ts";
import { Path } from "../../../utils/zon/types.ts";
import styles from "./Arc.module.css";
import { getNodeArcColors } from "../../../utils/zon/color.ts";
import { createMemo } from "solid-js";

type ArcProps = {
  node: SunburstNode;
  maxRadius: number;
  highlightedPath: Path | null;
  onMouseEnter?: JSX.EventHandler<SVGPathElement, MouseEvent>;
  onMouseLeave?: JSX.EventHandler<SVGPathElement, MouseEvent>;
  onClick?: JSX.EventHandler<SVGPathElement, MouseEvent>;
};

function Arc(props: ArcProps) {
  /**
   * Determines the SVG path data for a node's arc
   */
  function getNodeArcD(): string {
    const dimensions = props.node.dimensions();

    const outerRadius = dimensions.y0 * props.maxRadius;
    const innerRadius = dimensions.y1 * props.maxRadius;
    const startAngle = dimensions.x0 * 2 * Math.PI;
    const endAngle = dimensions.x1 * 2 * Math.PI;

    return getArcD({ innerRadius, outerRadius, startAngle, endAngle });
  }

  const colors = createMemo(() =>
    getNodeArcColors(props.node, props.highlightedPath),
  );

  return (
    <path
      d={getNodeArcD()}
      style={{
        "--arc-fill-color": colors().base,
        "--arc-highlight-color": colors().highlight,
        "--arc-press-color": colors().press,
        opacity: props.node.opacity(),
      }}
      class={styles.sunburst__arc}
      onMouseEnter={(e) => props.onMouseEnter?.(e)}
      onMouseLeave={(e) => props.onMouseLeave?.(e)}
      onClick={(e) => props.onClick?.(e)}
    />
  );
}

export default Arc;
