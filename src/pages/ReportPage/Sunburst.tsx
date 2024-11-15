import { For, type Setter } from "solid-js";
import { getArc } from "../../utils/svg.ts";
import {
  type Node,
  getDescendants,
  getNodeByPath,
  getParentPath,
} from "../../utils/zon.ts";

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

  const diagramRoot = () => getNodeByPath(props.root, props.diagramRootPath);
  const nodes = () => getDescendants(diagramRoot());

  function getArcDimensions(node: Node) {
    const root = diagramRoot();

    const firstLineFromRoot = node.firstLine - root.firstLine;
    const dx = node.numberOfLines / root.numberOfLines;
    const x0 = firstLineFromRoot / root.numberOfLines;
    const x1 = x0 + dx;

    const depthFromRoot = node.depth - root.depth;
    const dy = 1 / (root.height + centerRadius);
    const y0 = (depthFromRoot + centerRadius) / (root.height + centerRadius);
    const y1 = y0 - dy;

    return { x0, x1, y0, y1 };
  }

  function getNodeArc(dimensions: Dimensions) {
    const outerRadius = dimensions.y0 * maxRadius;
    const innerRadius = dimensions.y1 * maxRadius;
    const startAngle = dimensions.x0 * 2 * Math.PI;
    const endAngle = dimensions.x1 * 2 * Math.PI;

    return getArc({ innerRadius, outerRadius, startAngle, endAngle });
  }

  function navigate(node: Node) {
    const isReportRoot = node.path === props.root.path;
    const isDiagramRoot = node.path === props.diagramRootPath;
    const isFile = node.height === 0;

    if (isReportRoot) {
      props.setDiagramRootPath(null);
    } else if (isDiagramRoot || isFile) {
      props.setDiagramRootPath(getParentPath(node.path));
    } else {
      props.setDiagramRootPath(node.path);
    }
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
              onClick={[navigate, node]}
            />
          )}
        </For>
      </g>
    </svg>
  );
}
