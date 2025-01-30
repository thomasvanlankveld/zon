import { createMemo } from "solid-js";
import { getArcD } from "../../../utils/svg.ts";
import {
  arePathsEqual,
  DIAGRAM_ARC_GROUP_COLORS,
  getParentPath,
  isFile,
  isGroup,
  rainbow,
} from "../../../utils/zon";
import { useReportState } from "../ReportPage.state.tsx";
import { SunburstNode } from "./types.ts";
import styles from "./Sunburst.module.css";

type ArcProps = {
  node: SunburstNode;
  maxRadius: number;
};

function Arc(props: ArcProps) {
  const { navigate, diagramRoot, setHoverArcPath, expandGroup } =
    useReportState();

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
    isGroup(props.node)
      ? DIAGRAM_ARC_GROUP_COLORS
      : rainbow(props.node.colorValue),
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
        "--arc-regular-color": colors().regular,
        "--arc-active-color": colors().active,
        "--arc-deemphasize-color": colors().deemphasize,
        opacity: props.node.opacity(),
      }}
      class={styles.sunburst__arc}
      data-deemphasized={props.node.isDeemphasized()}
      onMouseEnter={() => setHoverArcPath(props.node.path)}
      onMouseLeave={() => setHoverArcPath(null)}
      onClick={onArcClick}
    />
  );
}

export default Arc;
