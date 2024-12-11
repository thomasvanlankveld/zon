import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  onMount,
  Show,
  type Setter,
} from "solid-js";
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
import styles from "./Arc.module.css";
import { Cubehelix } from "../../../utils/color.ts";
import { Dimensions, Descendant, DimensionKey } from "./types.ts";
import Arc from "./Arc.tsx";

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
  tolerance ??=
    Math.max(Math.min(Math.abs(a), Math.abs(b)), 1) * Number.EPSILON;

  return Math.abs(a - b) < tolerance;
}

function getAnimationTarget(value: number, target: number, dt: number) {
  return value + (target - value) * (1 - Math.exp(-dt * 0.013));
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
   * Determines the target path for a node's arc click
   */
  function getArcClickTarget(node: Node) {
    const isFile = node.type === NODE_TYPE.FILE;
    const isGroup = node.type === NODE_TYPE.GROUP;

    return isFile || isGroup ? getParentPath(node.path) : node.path;
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
        matchingDescendant.setTargetOpacity(1);
        matchingDescendant.setTargetDimensions(
          getArcDimensions(node, targetDiagramRoot(), targetMaxDistance()),
        );
      } else {
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
    requestAnimationFrame(function executeAnimationStep() {
      const animationTime = Date.now();

      // position.x += (target - position.x) * (1 - exp(- dt * speed));
      const dt = animationTime - time();
      const updates: {
        node: Descendant;
        newOpacity: number;
        newDimensions: Dimensions;
        isDoneAnimating: boolean;
      }[] = [];

      visibleDescendants().forEach((node) => {
        const targetOpacity = node.targetOpacity();
        const targetDimensions = node.targetDimensions();

        const newOpacity = getAnimationTarget(
          node.opacity(),
          targetOpacity,
          dt,
        );

        const dimEntries = Object.entries(node.dimensions()) as [
          DimensionKey,
          number,
        ][];
        const newDimEntries = dimEntries.map(([key, value]) => [
          key,
          getAnimationTarget(value, targetDimensions[key], dt),
        ]);
        const newDimensions = Object.fromEntries(newDimEntries) as Dimensions;

        const tolerance = 0.001;

        if (
          areNumbersEqual(newOpacity, targetOpacity, tolerance) &&
          areNumbersEqual(newDimensions.x0, targetDimensions.x0, tolerance) &&
          areNumbersEqual(newDimensions.x1, targetDimensions.x1, tolerance) &&
          areNumbersEqual(newDimensions.y0, targetDimensions.y0, tolerance) &&
          areNumbersEqual(newDimensions.y1, targetDimensions.y1, tolerance)
        ) {
          // TODO: Set opacity and dimensions to their exact target values
          updates.push({
            node,
            newOpacity: targetOpacity,
            newDimensions: targetDimensions,
            isDoneAnimating: true,
          });
        } else {
          updates.push({
            node,
            newOpacity,
            newDimensions,
            isDoneAnimating: false,
          });
        }
      });

      const animationsThatAreDone = updates.filter(
        (update) => update.isDoneAnimating,
      );
      const allDone =
        animationsThatAreDone.length === visibleDescendants().length;

      // Need to batch updates for all nodes together, or the animation crashes to a halt
      batch(() => {
        updates.forEach((update) => {
          update.node.setOpacity(update.newOpacity);
          update.node.setDimensions(update.newDimensions);
        });
        setTime(animationTime);

        if (allDone) {
          setVisibleDescendants((visibleDescendants) =>
            visibleDescendants.filter(
              (visibleNode) => visibleNode.targetOpacity() === 1,
            ),
          );
        }
      });

      if (!allDone) {
        animate();
      }
    });
  }

  function navigate(path: Path | null) {
    batch(() => {
      props.setSelectedRootPath(path);
      // If the path targets a group, we set the hovered arc path to it as well. This prevents breaking breadcrumbs
      // when clicking a group that will not exist anymore after "regrouping" due to the diagram root change.
      props.setHoverArcPath(path);
    });
  }

  const rootColors = (() => {
    const baseColor = new Cubehelix(0, 0, 1, 0.1);
    const highlightedColor = baseColor.cloudier(1).toRgbString();
    const pressedColor = baseColor.clearer(0.25).toRgbString();

    return {
      fill: baseColor.toRgbString(),
      highlighted: highlightedColor,
      pressed: pressedColor,
    };
  })();

  return (
    <svg
      ref={setSvg}
      viewBox={`${-0.5 * width()} ${-0.5 * height()} ${width()} ${height()}`}
    >
      <For each={visibleDescendants()}>
        {(descendant) => (
          <Arc
            node={descendant}
            maxRadius={maxRadius()}
            highlightedPath={props.highlightedPath}
            onMouseEnter={() => props.setHoverArcPath(descendant.path)}
            onMouseLeave={() => props.setHoverArcPath(null)}
            onClick={() => navigate(getArcClickTarget(descendant))}
          />
        )}
      </For>
      <Show when={!isReportRoot()}>
        <circle
          cx={0}
          cy={0}
          r={(1 / targetMaxDistance()) * maxRadius()}
          style={{
            "--arc-fill-color": rootColors.fill,
            "--arc-highlighted-color": rootColors.highlighted,
            "--arc-pressed-color": rootColors.pressed,
          }}
          class={styles.sunburst__arc}
          onMouseEnter={() => props.setHoverArcPath(targetDiagramRoot().path)}
          onMouseLeave={() => props.setHoverArcPath(null)}
          onClick={() => navigate(getParentPath(targetDiagramRoot().path))}
        />
      </Show>
    </svg>
  );
}
