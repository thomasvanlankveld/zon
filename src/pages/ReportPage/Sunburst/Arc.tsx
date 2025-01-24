import { createMemo } from "solid-js";
import { getArcD } from "../../../utils/svg.ts";
import {
  arePathsEqual,
  getNodeArcColors,
  getParentPath,
  isFile,
  isGroup,
} from "../../../utils/zon";
import { useReportState } from "../ReportPage.state.tsx";
import { SunburstNode } from "./types.ts";
import styles from "./Sunburst.module.css";

type ArcProps = {
  node: SunburstNode;
  maxRadius: number;
};

function Arc(props: ArcProps) {
  const {
    navigate,
    diagramRoot,
    highlightedDiagramPath,
    highlightedDiagramLineType,
    highlightedDiagramLanguage,
    setHoverArcPath,
    expandGroup,
  } = useReportState();

  /**
   * Determines the SVG path data for a node's arc
   */
  function getNodeArcD(): string {
    const dimensions = props.node.dimensions();

    const outerRadius = dimensions.y0 * props.maxRadius;
    const innerRadius = dimensions.y1 * props.maxRadius;
    const startAngle = dimensions.x0 * 2 * Math.PI;
    const endAngle = dimensions.x1 * 2 * Math.PI;

    return getArcD({ innerRadius, outerRadius, startAngle, endAngle });
  }

  const colors = createMemo(() =>
    getNodeArcColors(
      props.node,
      highlightedDiagramPath(),
      highlightedDiagramLineType(),
      highlightedDiagramLanguage(),
    ),
  );

  function onArcClick() {
    const isFileArc = isFile(props.node);
    const isGroupArc = isGroup(props.node);

    const arcClickTarget =
      isFileArc || isGroupArc
        ? getParentPath(props.node.path)
        : props.node.path;
    const targetIsDiagramRoot = arePathsEqual(
      arcClickTarget,
      diagramRoot().path,
    );

    if (isGroupArc && targetIsDiagramRoot) {
      expandGroup();
    } else if (targetIsDiagramRoot) {
      // If we allow navigating to the diagram root, clicking file arcs will cause the group to collapse
      return;
    } else {
      navigate(arcClickTarget);
    }
  }

  return (
    <path
      d={getNodeArcD()}
      style={{
        "--arc-base-color": colors().base,
        "--arc-highlight-color": colors().highlight,
        "--arc-press-color": colors().press,
        opacity: props.node.opacity(),
      }}
      class={styles.sunburst__arc}
      onMouseEnter={() => setHoverArcPath(props.node.path)}
      onMouseLeave={() => setHoverArcPath(null)}
      onClick={onArcClick}
    />
  );
}

export default Arc;
