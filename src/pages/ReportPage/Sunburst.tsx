import { createEffect, For, type Setter } from "solid-js";
import { getArc } from "../../utils/svg.ts";
import { type Node, getDescendants, getNodeByPath } from "../../utils/zon.ts";

type Dimensions = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

type SunburstProps = {
  root: Node;
  diagramRootPath: string;
  setHoverArcPath: Setter<string | null>;
  setDiagramRootPath: Setter<string | null>;
};

export default function Sunburst(props: SunburstProps) {
  const width = 500;
  const height = 500;
  const maxRadius = Math.min(width, height) / 2;
  const centerRadius = 0.8;

  const center = {
    x: width / 2,
    y: height / 2,
  };

  createEffect(() => console.log("diagramRootPath", props.diagramRootPath));
  const diagramRoot = () => getNodeByPath(props.root, props.diagramRootPath);
  const nodes = () => getDescendants(diagramRoot());

  function getArcDimensions(node: Node) {
    const x0 = node.firstLine / diagramRoot().numberOfLines;
    const x1 = x0 + node.numberOfLines / diagramRoot().numberOfLines;
    const y0 =
      (node.depth + centerRadius - diagramRoot().depth) /
      (diagramRoot().height + centerRadius);
    const y1 = y0 - 1 / (diagramRoot().height + centerRadius);

    return { x0, x1, y0, y1 };
  }

  function getNodeArc(dimensions: Dimensions) {
    const outerRadius = dimensions.y0 * maxRadius;
    const innerRadius = dimensions.y1 * maxRadius;
    const startAngle = dimensions.x0 * 2 * Math.PI;
    const endAngle = dimensions.x1 * 2 * Math.PI;

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
              d={getNodeArc(getArcDimensions(node))}
              fill={node.color}
              stroke="black"
              style={{ "stroke-width": "2px; opacity: 0.7", cursor: "pointer" }}
              onMouseEnter={[props.setHoverArcPath, node.path]}
              onMouseLeave={[props.setHoverArcPath, null]}
              onClick={[props.setDiagramRootPath, node.path]}
            />
          )}
        </For>
      </g>
    </svg>
  );
}
