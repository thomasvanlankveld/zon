import {
  batch,
  createMemo,
  createSignal,
  For,
  Show,
  type Setter,
} from "solid-js";
import { getArc as getArcD } from "../../../utils/svg.ts";
import {
  NODE_TYPE,
  type Node,
  type Path,
  getDescendants,
  getNodeByPath,
  getParentPath,
  getPathString,
  arePathsEqual,
} from "../../../utils/zon/index.ts";
import createElementSize from "../../../primitives/createElementSize.ts";
import styles from "./Sunburst.module.css";
import { Cubehelix } from "../../../utils/color.ts";

type Dimensions = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

type Arc = {
  d: string;
  clickTarget: Path;
  hoverTarget: Path;
  arcColors: {
    fill: string;
    highlighted: string;
    pressed: string;
  };
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

  const diagramRoot = createMemo(() =>
    getNodeByPath(props.root, props.diagramRootPath),
  );

  const isReportRoot = createMemo(() =>
    arePathsEqual(diagramRoot().path, props.root.path),
  );

  const numberOfFullLayers = 5;
  const numberOfNarrowLayers = 5;
  const totalLayers = numberOfFullLayers + numberOfNarrowLayers;
  const maxDepthFromRoot = createMemo(() =>
    Math.min(totalLayers, diagramRoot().height),
  );

  const distanceFull = 1;
  // All narrow layers together take up the same distance as one full layer
  const distanceNarrow = distanceFull / numberOfNarrowLayers;

  /**
   * Determines the outer "distance" of a node's arc based on its depth
   * In "distance", "1" is the default width of an arc
   */
  function getDistance(depthFromRoot: number) {
    return (
      centerRadius +
      Math.max(0, Math.min(depthFromRoot, numberOfFullLayers)) * distanceFull +
      Math.max(0, depthFromRoot - numberOfFullLayers) * distanceNarrow
    );
  }

  const maxDistance = createMemo(() => getDistance(maxDepthFromRoot()));

  /**
   * Determines the dimensions of a node's arc
   * The dimensions are returned in a range of 0-1
   */
  function getArcDimensions(node: Node): Dimensions {
    const root = diagramRoot();

    if (node.numberOfLines === 0) {
      throw new Error(
        `Can't draw an arc for node ${getPathString(node.path)} because it has 0 lines`,
      );
    }

    // First determine x positions in "lines", then scale to a range of 0-1
    const firstLineFromRoot = node.firstLine - root.firstLine;
    const dx = node.numberOfLines / root.numberOfLines;
    const x0 = firstLineFromRoot / root.numberOfLines;
    const x1 = x0 + dx;

    // First determine y positions in "distance", where "1" is the default "depth" of a single arc
    const depthFromRoot = node.depth - root.depth;
    const isNarrow = depthFromRoot > numberOfFullLayers;
    const nodeOuterDistance = getDistance(depthFromRoot);
    const dDistance = isNarrow ? distanceNarrow : distanceFull;

    // Then scale to a range of 0-1
    const dy = dDistance / maxDistance();
    const y0 = nodeOuterDistance / maxDistance();
    const y1 = Math.max(y0 - dy, 0);

    return { x0, x1, y0, y1 };
  }

  /**
   * Determines the SVG path data for a node's arc
   */
  function getNodeArcD(dimensions: Dimensions): string {
    const outerRadius = dimensions.y0 * maxRadius();
    const innerRadius = dimensions.y1 * maxRadius();
    const startAngle = dimensions.x0 * 2 * Math.PI;
    const endAngle = dimensions.x1 * 2 * Math.PI;

    return getArcD({ innerRadius, outerRadius, startAngle, endAngle });
  }

  const rootArc = createMemo((): Arc => {
    const baseColor = new Cubehelix(0, 0, 1, 0.1);
    const highlightedColor = baseColor.cloudier(1).toRgbString();
    const pressedColor = baseColor.clearer(0.25).toRgbString();

    return {
      d: getNodeArcD(getArcDimensions(diagramRoot())),
      clickTarget: getParentPath(diagramRoot().path),
      hoverTarget: diagramRoot().path,
      arcColors: {
        fill: baseColor.toRgbString(),
        highlighted: highlightedColor,
        pressed: pressedColor,
      },
    };
  });

  /**
   * Determines the target path for a node's arc click
   */
  function getArcClickTarget(node: Node) {
    const isFile = node.type === NODE_TYPE.FILE;
    const isGroup = node.type === NODE_TYPE.GROUP;

    return isFile || isGroup ? getParentPath(node.path) : node.path;
  }

  /**
   * Determines the colors of a node's arc
   */
  function getArcColors(node: Node) {
    const isHighlighted = arePathsEqual(props.highlightedPath, node.path);

    return {
      ...node.colors,
      fill: isHighlighted ? node.colors.highlighted : node.colors.base,
    };
  }

  const arcs = () =>
    getDescendants(diagramRoot(), {
      exclude: {
        // Can't render arcs for nodes with 0 lines
        minLines: 1,
        maxDepth: diagramRoot().depth + maxDepthFromRoot(),
      },
    })
      // Skip the root arc, which is rendered separately
      .slice(1)
      .map(
        (node): Arc => ({
          d: getNodeArcD(getArcDimensions(node)),
          clickTarget: getArcClickTarget(node),
          hoverTarget: node.path,
          arcColors: getArcColors(node),
        }),
      );

  function navigate(path: Path | null) {
    batch(() => {
      props.setSelectedRootPath(path);
      // If the path targets a group, we set the hovered arc path to it as well. This prevents breaking breadcrumbs
      // when clicking a group that will not exist anymore after "regrouping" due to the diagram root change.
      props.setHoverArcPath(path);
    });
  }

  return (
    <svg
      ref={setSvg}
      viewBox={`${-0.5 * width()} ${-0.5 * height()} ${width()} ${height()}`}
    >
      <Show when={!isReportRoot()}>
        <path
          d={rootArc().d}
          style={{
            "--arc-fill-color": rootArc().arcColors.fill,
            "--arc-highlighted-color": rootArc().arcColors.highlighted,
            "--arc-pressed-color": rootArc().arcColors.pressed,
          }}
          class={styles.sunburst__arc}
          onMouseEnter={() => props.setHoverArcPath(rootArc().hoverTarget)}
          onMouseLeave={() => props.setHoverArcPath(null)}
          onClick={() => navigate(rootArc().clickTarget)}
        />
      </Show>
      <For each={arcs()}>
        {(arc) => (
          <path
            d={arc.d}
            style={{
              "--arc-fill-color": arc.arcColors.fill,
              "--arc-highlighted-color": arc.arcColors.highlighted,
              "--arc-pressed-color": arc.arcColors.pressed,
            }}
            class={styles.sunburst__arc}
            onMouseEnter={[props.setHoverArcPath, arc.hoverTarget]}
            onMouseLeave={[props.setHoverArcPath, null]}
            onClick={[navigate, arc.clickTarget]}
          />
        )}
      </For>
    </svg>
  );
}
