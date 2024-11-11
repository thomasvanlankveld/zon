import { arc } from "./utils/svg.ts";
import { Node, getDescendants } from "./utils/zon.ts";

function DonutSegment(props: {
  d: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const { d, onMouseEnter, onMouseLeave } = props;

  return (
    <path
      d={d}
      fill="#98abc5"
      stroke="black"
      style="stroke-width: 2px; opacity: 0.7;"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    ></path>
  );
}

export default function Donut(props: {
  root: Node;
  setHoveredArcFilePath: (path: string | null) => void;
}) {
  const { root, setHoveredArcFilePath } = props;

  const width = 500;
  const height = 500;
  const maxRadius = Math.min(width, height) / 2;

  const center = {
    x: width / 2,
    y: height / 2,
  };

  const nodes = getDescendants(root);

  function getArc(node: Node) {
    const outerRadius = node.dimensions.y0 * maxRadius;
    const innerRadius = node.dimensions.y1 * maxRadius;
    const startAngle = node.dimensions.x0 * 2 * Math.PI + Math.PI;
    const endAngle = node.dimensions.x1 * 2 * Math.PI + Math.PI;

    return arc({ innerRadius, outerRadius, startAngle, endAngle });
  }

  // TODO:
  // - FIX DEPTH BUG WHEN SCANNING EVERON-PORTAL
  // - Add padding between segments?
  // - Leave some room for stroke, between svg width / height and the outermost arcs
  // - Zoom "slider"?
  return (
    <svg width={width} height={height}>
      <g transform={`translate(${center.x},${center.y})`}>
        {nodes.map((node) => (
          <DonutSegment
            d={getArc(node)}
            onMouseEnter={() => setHoveredArcFilePath(node.path)}
            onMouseLeave={() => setHoveredArcFilePath(null)}
          />
        ))}
      </g>
    </svg>
  );
}
