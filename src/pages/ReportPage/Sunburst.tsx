import {
  batch,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  type Setter,
} from "solid-js";
import { getArc } from "../../utils/svg.ts";
import {
  NODE_TYPE,
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
  const [width, setWidth] = createSignal(500);
  const [height, setHeight] = createSignal(500);
  const maxRadius = createMemo(() => Math.min(width(), height()) / 2);
  const centerRadius = 1;

  let svg: SVGSVGElement | undefined;

  const resizeObserver = new ResizeObserver((entries) => {
    const svgResize = entries.at(-1);

    if (svgResize == null) {
      return;
    }

    batch(() => {
      setWidth(svgResize.contentRect.width);
      setHeight(svgResize.contentRect.height);
    });
  });

  onMount(() => {
    resizeObserver.observe(svg as SVGSVGElement);
  });

  onCleanup(() => {
    resizeObserver.unobserve(svg as SVGSVGElement);
  });

  const center = createMemo(() => ({
    x: width() / 2,
    y: height() / 2,
  }));

  const diagramRoot = createMemo(() =>
    getNodeByPath(props.root, props.diagramRootPath),
  );
  const maxDepth = createMemo(() =>
    // TODO: diagramRoot().height needs to refer to the visible height (after "exclude" filtering)
    Math.min(diagramRoot().depth + 8, diagramRoot().height),
  );

  function getArcDimensions(node: Node) {
    const root = diagramRoot();

    if (node.numberOfLines === 0) {
      throw new Error(
        `Can't draw an arc for node ${node.path} because it has 0 lines`,
      );
    }

    const firstLineFromRoot = node.firstLine - root.firstLine;
    const dx = node.numberOfLines / root.numberOfLines;
    const x0 = firstLineFromRoot / root.numberOfLines;
    const x1 = x0 + dx;

    const depthFromRoot = node.depth - root.depth;
    const dy = 1 / (maxDepth() + centerRadius);
    const y0 = (depthFromRoot + centerRadius) / (maxDepth() + centerRadius);
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

  const nodes = () =>
    // TODO: Move exclusion and grouping to an earlier stage, for easy consistency with list and breadcrumbs
    getDescendants(diagramRoot(), {
      exclude: { minLines: 1, maxDepth: maxDepth() }, // Can't render arcs for nodes with 0 lines
      group: {
        // TODO: Make center segments larger, so we can maybe increase the factor
        // TODO: Make factor depend on chart size? (Share with list for consistency)
        minLines: Math.floor(diagramRoot().numberOfLines / 150),
        maxChildren: 10, // TODO: Make user-modify-able
      },
    }).map((node) => ({ ...node, arc: getNodeArc(getArcDimensions(node)) }));

  function navigate(node: Node) {
    const isReportRoot = node.path === props.root.path;
    const isDiagramRoot = node.path === props.diagramRootPath;
    const isFile = node.type === NODE_TYPE.FILE;
    const isSummary = node.type === NODE_TYPE.SUMMARY;

    if (isReportRoot) {
      props.setDiagramRootPath(null);
    } else if (isDiagramRoot || isFile || isSummary) {
      props.setDiagramRootPath(getParentPath(node.path));
    } else {
      props.setDiagramRootPath(node.path);
    }
  }

  // TODO:
  // - Add padding between segments?
  // - Leave some room for stroke, between svg width / height and the outermost arcs
  // - Zoom "slider"?
  return (
    <svg ref={svg} style={{ flex: "1 1 0%" }}>
      <g transform={`translate(${center().x},${center().y})`}>
        <For each={nodes()}>
          {(node) => (
            <path
              d={node.arc}
              fill-rule="evenodd"
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
