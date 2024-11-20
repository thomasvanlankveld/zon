import { createMemo, createSignal, For, type Setter } from "solid-js";
import { getArc } from "../../utils/svg.ts";
import {
  NODE_TYPE,
  type Node,
  type Path,
  getDescendants,
  getNodeByPath,
  getParentPath,
  getPathString,
} from "../../utils/zon.ts";
import createElementSize from "../../primitives/createElementSize.ts";

type Dimensions = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

type SunburstProps = {
  root: Node;
  diagramRootPath: Path;
  setHoverArcPath: Setter<Path | null>;
  setDiagramRootPath: Setter<Path | null>;
};

export default function Sunburst(props: SunburstProps) {
  const [svg, setSvg] = createSignal<SVGSVGElement>();
  const { width, height } = createElementSize(svg, { width: 500, height: 500 });

  const maxRadius = createMemo(() => Math.min(width(), height()) / 2);
  const centerRadius = 1;
  const center = createMemo(() => ({
    x: width() / 2,
    y: height() / 2,
  }));

  const diagramRoot = createMemo(() =>
    getNodeByPath(props.root, props.diagramRootPath),
  );
  const maxDepthFromRoot = createMemo(() => Math.min(8, diagramRoot().height));

  function getArcDimensions(node: Node) {
    const root = diagramRoot();

    if (node.numberOfLines === 0) {
      throw new Error(
        `Can't draw an arc for node ${getPathString(node.path)} because it has 0 lines`,
      );
    }

    const firstLineFromRoot = node.firstLine - root.firstLine;
    const dx = node.numberOfLines / root.numberOfLines;
    const x0 = firstLineFromRoot / root.numberOfLines;
    const x1 = x0 + dx;

    const depthFromRoot = node.depth - root.depth;
    const dy = 1 / (maxDepthFromRoot() + centerRadius);
    const y0 =
      (depthFromRoot + centerRadius) / (maxDepthFromRoot() + centerRadius);
    const y1 = Math.max(y0 - dy, 0);

    // TODO: Instead of a continuous scale, make a cutoff between wide inner segments and thin outer ones
    return { x0, x1, y0, y1 };
  }

  function getNodeArc(dimensions: Dimensions) {
    const outerRadius = dimensions.y0 * maxRadius();
    const innerRadius = dimensions.y1 * maxRadius();
    const startAngle = dimensions.x0 * 2 * Math.PI;
    const endAngle = dimensions.x1 * 2 * Math.PI;

    return getArc({ innerRadius, outerRadius, startAngle, endAngle });
  }

  function getTargetPaths(node: Node) {
    const isReportRoot = node.path === props.root.path;
    const isDiagramRoot = node.path === props.diagramRootPath;
    const isFile = node.type === NODE_TYPE.FILE;
    const isGroup = node.type === NODE_TYPE.GROUP;

    if (isReportRoot) {
      return { clickTarget: null, hoverTarget: null };
    }

    if (isDiagramRoot) {
      return { clickTarget: getParentPath(node.path), hoverTarget: node.path };
    }

    const targetPath = isFile || isGroup ? getParentPath(node.path) : node.path;

    return { clickTarget: targetPath, hoverTarget: targetPath };
  }

  const nodes = () =>
    // TODO: Move exclusion and grouping to an earlier stage, for easy consistency with list and breadcrumbs
    getDescendants(diagramRoot(), {
      exclude: {
        // Can't render arcs for nodes with 0 lines
        minLines: 1,
        maxDepth: diagramRoot().depth + maxDepthFromRoot(),
      },
    }).map((node, i) => ({
      ...node,
      ...getTargetPaths(node),
      arc: getNodeArc(getArcDimensions(node)),
      color: i === 0 ? "transparent" : node.color,
    }));

  // TODO:
  // - Add padding between segments?
  // - Leave some room for stroke, between svg width / height and the outermost arcs
  // - Zoom "slider"?
  return (
    <svg ref={setSvg} style={{ flex: "1 1 0%" }}>
      <g transform={`translate(${center().x},${center().y})`}>
        <For each={nodes()}>
          {(node) => (
            <path
              d={node.arc}
              fill-rule="evenodd"
              fill={node.color}
              stroke="black"
              style={{ "stroke-width": "2px; opacity: 0.7", cursor: "pointer" }}
              onMouseEnter={[props.setHoverArcPath, node.hoverTarget]}
              onMouseLeave={[props.setHoverArcPath, null]}
              onClick={[props.setDiagramRootPath, node.clickTarget]}
            />
          )}
        </For>
      </g>
    </svg>
  );
}
