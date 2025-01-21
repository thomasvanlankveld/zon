import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  onMount,
} from "solid-js";
import {
  type Node,
  getDescendants,
  getPathString,
  arePathsEqual,
} from "../../../utils/zon/index.ts";
import createElementSize from "../../../primitives/createElementSize.ts";
import { Dimensions, SunburstNode, DimensionKey } from "./types.ts";
import Arc from "./Arc.tsx";
import { useReportState } from "../ReportPage.state.tsx";
import Center from "./Center.tsx";

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

export default function Sunburst() {
  const { diagramRoot: targetDiagramRoot, highlightedDiagramPath } =
    useReportState();

  const [svg, setSvg] = createSignal<SVGSVGElement>();
  const { width, height } = createElementSize(svg);

  const maxRadius = createMemo(() => Math.min(width(), height()) / 2);
  const centerRadius = 1;

  const [actualDiagramRoot, setActualDiagramRoot] = createSignal<Node | null>(
    null,
  );
  onMount(() => {
    setActualDiagramRoot(targetDiagramRoot());
  });

  const numberOfFullLayers = 3;
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

  const targetNodes = createMemo(() =>
    getDescendants(targetDiagramRoot(), {
      exclude: {
        minLines: 1,
        maxDepth: targetDiagramRoot().depth + targetMaxDepthFromRoot(),
      },
    }).slice(1),
  );

  const [visibleNodes, setVisibleNodes] = createSignal<SunburstNode[]>([]);

  createEffect(function updateVisibleNodes(prevTargetNodes) {
    // Only run this effect if the target descendants have changed
    if (prevTargetNodes === targetNodes()) {
      return targetNodes();
    }

    const newNodes: SunburstNode[] = [];

    targetNodes().forEach((targetNode) => {
      const matchingNode = visibleNodes().find((visibleNode) =>
        arePathsEqual(visibleNode.path, targetNode.path),
      );

      if (matchingNode) {
        matchingNode.setTargetOpacity(1);
        matchingNode.setTargetDimensions(
          getArcDimensions(
            targetNode,
            targetDiagramRoot(),
            targetMaxDistance(),
          ),
        );
      } else {
        const [opacity, setOpacity] = createSignal(0);
        const [targetOpacity, setTargetOpacity] = createSignal(1);
        const [dimensions, setDimensions] = createSignal(
          getArcDimensions(
            targetNode,
            actualDiagramRoot() as Node,
            actualMaxDistance(),
          ),
        );
        const [targetDimensions, setTargetDimensions] = createSignal(
          getArcDimensions(
            targetNode,
            targetDiagramRoot(),
            targetMaxDistance(),
          ),
        );

        newNodes.push({
          ...targetNode,
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

    visibleNodes().forEach((visibleNode) => {
      const shouldStillBeVisible = targetNodes().some((targetNode) =>
        arePathsEqual(targetNode.path, visibleNode.path),
      );

      if (shouldStillBeVisible) {
        return;
      }

      visibleNode.setTargetOpacity(0);
      // Even though the node will be removed, we still need to animate it to its target position
      visibleNode.setTargetDimensions(
        getArcDimensions(visibleNode, targetDiagramRoot(), targetMaxDistance()),
      );
    });

    setVisibleNodes([...visibleNodes(), ...newNodes]);
    setActualDiagramRoot(targetDiagramRoot());
    setActualMaxDistance(targetMaxDistance());

    setTime(Date.now());
    animate();

    return targetNodes();
  });

  const [time, setTime] = createSignal(Date.now());

  function animate() {
    requestAnimationFrame(function executeAnimationStep() {
      const animationTime = Date.now();

      // position.x += (target - position.x) * (1 - exp(- dt * speed));
      const dt = animationTime - time();
      const updates: {
        node: SunburstNode;
        newOpacity: number;
        newDimensions: Dimensions;
        isDoneAnimating: boolean;
      }[] = [];

      visibleNodes().forEach((node) => {
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
      const allDone = animationsThatAreDone.length === visibleNodes().length;

      // Need to batch updates for all nodes together, or the animation crashes to a halt
      batch(() => {
        updates.forEach((update) => {
          update.node.setOpacity(update.newOpacity);
          update.node.setDimensions(update.newDimensions);
        });
        setTime(animationTime);

        if (allDone) {
          setVisibleNodes((oldVisibleNodes) =>
            oldVisibleNodes.filter(
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

  return (
    <svg
      ref={setSvg}
      viewBox={`${-0.5 * width()} ${-0.5 * height()} ${width()} ${height()}`}
    >
      <For each={visibleNodes()}>
        {(node) => (
          <Arc
            node={node}
            maxRadius={maxRadius()}
            highlightedPath={highlightedDiagramPath()}
          />
        )}
      </For>
      <Center radius={(1 / targetMaxDistance()) * maxRadius()} />
    </svg>
  );
}
