import { getArcD } from "../../../utils/svg.ts";
import { SunburstNode } from "./types.ts";
import { isFile, isGroup, Path } from "../../../utils/zon/types.ts";
import styles from "./Sunburst.module.css";
import { getNodeArcColors } from "../../../utils/zon/color.ts";
import { createMemo } from "solid-js";
import { arePathsEqual, getParentPath } from "../../../utils/zon/path.ts";
import { useReportStore } from "../ReportPage.store.tsx";

type ArcProps = {
  node: SunburstNode;
  maxRadius: number;
  highlightedPath: Path | null;
};

function Arc(props: ArcProps) {
  const { navigate, diagramRoot, setHoverArcPath, expandGroup } =
    useReportStore();

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
    getNodeArcColors(props.node, props.highlightedPath),
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
