import { For, type Setter } from "solid-js";
import { getArc } from "../../utils/svg.ts";
import { type Node, getDescendants } from "../../utils/zon.ts";

type SunburstProps = {
  root: Node;
  setHoverArcPath: Setter<string | null>;
};

export default function Sunburst(props: SunburstProps) {
  const width = 500;
  const height = 500;
  const maxRadius = Math.min(width, height) / 2;

  const center = {
    x: width / 2,
    y: height / 2,
  };

  const nodes = () => getDescendants(props.root);

  function getArcFromNode(node: Node) {
    const outerRadius = node.dimensions.y0 * maxRadius;
    const innerRadius = node.dimensions.y1 * maxRadius;
    const startAngle = node.dimensions.x0 * 2 * Math.PI + Math.PI;
    const endAngle = node.dimensions.x1 * 2 * Math.PI + Math.PI;

    return getArc({ innerRadius, outerRadius, startAngle, endAngle });
  }

  // TODO:
  // - FIX DEPTH BUG WHEN SCANNING EVERON-PORTAL
  // - Add padding between segments?
  // - Leave some room for stroke, between svg width / height and the outermost arcs
  // - Zoom "slider"?
  return (
    <svg width={width} height={height}>
      <g transform={`translate(${center.x},${center.y})`}>
        <For each={nodes()}>
          {(node) => (
            <path
              d={getArcFromNode(node)}
              fill="#98abc5"
              stroke="black"
              style={{ "stroke-width": "2px; opacity: 0.7" }}
              onMouseEnter={[props.setHoverArcPath, node.path]}
              onMouseLeave={[props.setHoverArcPath, null]}
            />
          )}
        </For>
      </g>
    </svg>
  );
}
