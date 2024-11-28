import { batch, createMemo, createSignal, For, type Setter } from "solid-js";
import { getArc } from "../../utils/svg.ts";
import {
  NODE_TYPE,
  type Node,
  type Path,
  getDescendants,
  getNodeByPath,
  getParentPath,
  getPathString,
  arePathsEqual,
} from "../../utils/zon";
import createElementSize from "../../primitives/createElementSize.ts";
import styles from "./Sunburst.module.css";

type Dimensions = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

type SunburstProps = {
  root: Node;
  diagramRootPath: Path;
  highlightedPath: Path | null;
  setHoverArcPath: Setter<Path | null>;
  setSelectedRootPath: Setter<Path | null>;
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

  function getArcDimensions(node: Node): Dimensions {
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

  function getNodeArc(dimensions: Dimensions): string {
    const outerRadius = dimensions.y0 * maxRadius();
    const innerRadius = dimensions.y1 * maxRadius();
    const startAngle = dimensions.x0 * 2 * Math.PI;
    const endAngle = dimensions.x1 * 2 * Math.PI;

    return getArc({ innerRadius, outerRadius, startAngle, endAngle });
  }

  function getTargetPaths(node: Node) {
    const isReportRoot = arePathsEqual(node.path, props.root.path);

    if (isReportRoot) {
      return { clickTarget: null, hoverTarget: null };
    }

    const isDiagramRoot = arePathsEqual(node.path, props.diagramRootPath);
    const isFile = node.type === NODE_TYPE.FILE;
    const isGroup = node.type === NODE_TYPE.GROUP;

    if (isDiagramRoot || isFile || isGroup) {
      return { clickTarget: getParentPath(node.path), hoverTarget: node.path };
    }

    return { clickTarget: node.path, hoverTarget: node.path };
  }

  function getArcColors(node: Node) {
    const isDiagramRoot = arePathsEqual(node.path, props.diagramRootPath);

    if (isDiagramRoot) {
      return {
        fill: "transparent",
        highlighted: "transparent",
        pressed: "transparent",
      };
    }

    const isHighlighted = arePathsEqual(props.highlightedPath, node.path);

    return {
      ...node.colors,
      fill: isHighlighted ? node.colors.highlighted : node.colors.base,
    };
  }

  const nodes = () =>
    getDescendants(diagramRoot(), {
      exclude: {
        // Can't render arcs for nodes with 0 lines
        minLines: 1,
        maxDepth: diagramRoot().depth + maxDepthFromRoot(),
      },
    }).map((node) => {
      return {
        ...node,
        ...getTargetPaths(node),
        arc: getNodeArc(getArcDimensions(node)),
        arcColors: getArcColors(node),
      };
    });

  function navigate(path: Path | null) {
    batch(() => {
      props.setSelectedRootPath(path);
      // If the path targets a group, we set the hovered arc path to it as well. This prevents breaking breadcrumbs
      // when clicking a group that will not exist anymore after "regrouping" due to the diagram root change.
      props.setHoverArcPath(path);
    });
  }

  return (
    <svg ref={setSvg}>
      <g transform={`translate(${center().x},${center().y})`}>
        <For each={nodes()}>
          {(node) => (
            <path
              d={node.arc}
              style={{
                "--arc-fill-color": node.arcColors.fill,
                "--arc-highlighted-color": node.arcColors.highlighted,
                "--arc-pressed-color": node.arcColors.pressed,
              }}
              class={styles.sunburst__arc}
              onMouseEnter={[props.setHoverArcPath, node.hoverTarget]}
              onMouseLeave={[props.setHoverArcPath, null]}
              onClick={[navigate, node.clickTarget]}
            />
          )}
        </For>
      </g>
    </svg>
  );
}
