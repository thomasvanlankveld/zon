import {
  Accessor,
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  onMount,
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

type Descendant = Node & {
  zIndex: Accessor<number>;
  setZIndex: Setter<number>;
  opacity: Accessor<number>;
  setOpacity: Setter<number>;
  targetOpacity: Accessor<number>;
  setTargetOpacity: Setter<number>;
  dimensions: Accessor<Dimensions>;
  setDimensions: Setter<Dimensions>;
  targetDimensions: Accessor<Dimensions>;
  setTargetDimensions: Setter<Dimensions>;
};

type Arc = {
  d: string;
  zIndex: number;
  opacity: number;
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function areNumbersEqual(a: number, b: number, tolerance?: number) {
  tolerance ??= Math.min(Math.abs(a), Math.abs(b)) * Number.EPSILON;

  return Math.abs(a - b) < tolerance;
}

function getAnimationTarget(value: number, target: number, dt: number) {
  return value + (target - value) * (1 - Math.exp(-dt * 0.01));
}

export default function Sunburst(props: SunburstProps) {
  const [svg, setSvg] = createSignal<SVGSVGElement>();
  const { width, height } = createElementSize(svg, { width: 500, height: 500 });

  const maxRadius = createMemo(() => Math.min(width(), height()) / 2);
  const centerRadius = 1;

  const targetDiagramRoot = createMemo(() =>
    getNodeByPath(props.root, props.diagramRootPath),
  );

  const [actualDiagramRoot, setActualDiagramRoot] = createSignal<Node | null>(
    null,
  );
  onMount(() => {
    setActualDiagramRoot(targetDiagramRoot());
  });

  const isReportRoot = createMemo(() =>
    arePathsEqual(targetDiagramRoot().path, props.root.path),
  );

  const numberOfFullLayers = 5;
  const numberOfNarrowLayers = 5;
  const totalLayers = numberOfFullLayers + numberOfNarrowLayers;
  const targetMaxDepthFromRoot = createMemo(() =>
    Math.min(totalLayers, targetDiagramRoot().height),
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

  const targetMaxDistance = createMemo(() =>
    getDistance(targetMaxDepthFromRoot()),
  );
  const [actualMaxDistance, setActualMaxDistance] = createSignal(totalLayers);
  onMount(() => {
    setActualMaxDistance(targetMaxDistance());
  });

  /**
   * Determines the dimensions of a node's arc
   * The dimensions are returned in a range of 0-1
   */
  function getArcDimensions(
    node: Node,
    diagramRoot: Node,
    maxDistance: number,
  ): Dimensions {
    if (node.numberOfLines === 0) {
      throw new Error(
        `Can't draw an arc for node ${getPathString(node.path)} because it has 0 lines`,
      );
    }

    // First determine x positions in "lines", then scale to a range of 0-1
    const firstLineFromRoot = node.firstLine - diagramRoot.firstLine;
    const dx = node.numberOfLines / diagramRoot.numberOfLines;
    const x0 = firstLineFromRoot / diagramRoot.numberOfLines;
    const x1 = x0 + dx;

    // First determine y positions in "distance", where "1" is the default "depth" of a single arc
    const depthFromRoot = node.depth - diagramRoot.depth;
    const isNarrow = depthFromRoot > numberOfFullLayers;
    const nodeOuterDistance = getDistance(depthFromRoot);
    const dDistance = isNarrow ? distanceNarrow : distanceFull;

    // Then scale to a range of 0-1
    const dy = dDistance / maxDistance;
    const y0 = nodeOuterDistance / maxDistance;
    const y1 = Math.max(y0 - dy, 0);

    return { x0: clamp(x0, 0, 1), x1: clamp(x1, 0, 1), y0, y1 };
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
      d: getNodeArcD(
        getArcDimensions(
          targetDiagramRoot(),
          targetDiagramRoot(),
          targetMaxDistance(),
        ),
      ),
      zIndex: 2,
      opacity: 1,
      clickTarget: getParentPath(targetDiagramRoot().path),
      hoverTarget: targetDiagramRoot().path,
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

  const targetDescendants = createMemo(() =>
    getDescendants(targetDiagramRoot(), {
      exclude: {
        minLines: 1,
        maxDepth: targetDiagramRoot().depth + targetMaxDepthFromRoot(),
      },
    }).slice(1),
  );

  const [visibleDescendants, setVisibleDescendants] = createSignal<
    Descendant[]
  >([]);

  createEffect(function updateVisibleDescendants(prevTargetDescendants) {
    // Only run this effect if the target descendants have changed
    if (prevTargetDescendants === targetDescendants()) {
      return targetDescendants();
    }

    const newDescendants: Descendant[] = [];

    targetDescendants().forEach((node) => {
      const matchingDescendant = visibleDescendants().find((descendant) =>
        arePathsEqual(descendant.path, node.path),
      );

      if (matchingDescendant) {
        matchingDescendant.setZIndex(1);
        matchingDescendant.setTargetOpacity(1);
        matchingDescendant.setTargetDimensions(
          getArcDimensions(node, targetDiagramRoot(), targetMaxDistance()),
        );
      } else {
        const [zIndex, setZIndex] = createSignal(1);
        const [opacity, setOpacity] = createSignal(0);
        const [targetOpacity, setTargetOpacity] = createSignal(1);
        const [dimensions, setDimensions] = createSignal(
          getArcDimensions(
            node,
            actualDiagramRoot() as Node,
            actualMaxDistance(),
          ),
        );
        const [targetDimensions, setTargetDimensions] = createSignal(
          getArcDimensions(node, targetDiagramRoot(), targetMaxDistance()),
        );

        newDescendants.push({
          ...node,
          zIndex,
          setZIndex,
          opacity,
          setOpacity,
          targetOpacity,
          setTargetOpacity,
          dimensions,
          setDimensions,
          targetDimensions,
          setTargetDimensions,
        });
      }
    });

    visibleDescendants().forEach((descendant) => {
      const matchingNewDescendant = targetDescendants().find((newDescendant) =>
        arePathsEqual(newDescendant.path, descendant.path),
      );

      if (!matchingNewDescendant) {
        descendant.setZIndex(0);
        descendant.setTargetOpacity(0);
        descendant.setTargetDimensions(
          getArcDimensions(
            descendant,
            targetDiagramRoot(),
            targetMaxDistance(),
          ),
        );
      }
    });

    setVisibleDescendants([...visibleDescendants(), ...newDescendants]);
    setActualDiagramRoot(targetDiagramRoot());
    setActualMaxDistance(targetMaxDistance());

    setTime(Date.now());
    animate();

    return targetDescendants();
  });

  const [time, setTime] = createSignal(Date.now());

  function animate() {
    requestAnimationFrame(() => {
      const animationTime = Date.now();

      // position.x += (target - position.x) * (1 - exp(- dt * speed));
      const dt = animationTime - time();
      const nodePathsToRemove: Path[] = [];

      visibleDescendants().forEach((node) => {
        const newOpacity = getAnimationTarget(
          node.opacity(),
          node.targetOpacity(),
          dt,
        );
        const dimensions = Object.entries(node.dimensions());
        const targetDimensions = Object.values(node.targetDimensions());
        const newDimensions = dimensions.map(([key, value], index) => [
          key,
          getAnimationTarget(value, targetDimensions[index], dt),
        ]);

        batch(() => {
          node.setOpacity(newOpacity);
          node.setDimensions(Object.fromEntries(newDimensions) as Dimensions);
        });

        if (
          node.targetOpacity() === 0 &&
          areNumbersEqual(node.opacity(), node.targetOpacity(), 0.01)
        ) {
          // TODO: Set opacity and dimensions to their exact target values
          nodePathsToRemove.push(node.path);
        }
      });

      setTime(animationTime);

      if (nodePathsToRemove.length > 0) {
        setVisibleDescendants((visibleDescendants) =>
          visibleDescendants.filter(
            (visibleNode) =>
              !nodePathsToRemove.some((pathToRemove) =>
                arePathsEqual(visibleNode.path, pathToRemove),
              ),
          ),
        );
      } else {
        animate();
      }
    });
  }

  const arcs = () =>
    visibleDescendants()
      .map(
        (node): Arc => ({
          d: getNodeArcD(node.dimensions()),
          zIndex: node.zIndex(),
          opacity: node.opacity(),
          clickTarget: getArcClickTarget(node),
          hoverTarget: node.path,
          arcColors: getArcColors(node),
        }),
      )
      .toSorted((a, b) => a.zIndex - b.zIndex);

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
              "z-index": arc.zIndex,
              opacity: arc.opacity,
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
