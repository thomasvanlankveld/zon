import { createMemo, Show } from "solid-js";
import {
  arePathsEqual,
  DIAGRAM_ROOT_COLORS,
  getBaseColor,
  getParentPath,
} from "../../../utils/zon";
import { useReportState } from "../ReportPage.state";
import styles from "./Sunburst.module.css";

type CenterProps = {
  radius: number;
};

export default function Center(props: CenterProps) {
  const {
    reportRoot,
    navigate,
    diagramRoot,
    highlightedDiagramPath,
    setHoverArcPath,
  } = useReportState();

  const isReportRoot = createMemo(() =>
    arePathsEqual(diagramRoot().path, reportRoot().path),
  );

  const rootColors = createMemo(() => {
    if (isReportRoot()) {
      return { base: "", highlight: "", active: "" };
    }

    const staticColors = DIAGRAM_ROOT_COLORS;

    return {
      base: getBaseColor(
        staticColors,
        diagramRoot().path,
        highlightedDiagramPath(),
      ),
      highlight: staticColors.highlight,
      active: staticColors.active,
    };
  });

  return (
    <Show when={!isReportRoot()}>
      <circle
        cx={0}
        cy={0}
        r={props.radius}
        style={{
          "--arc-regular-color": rootColors().base,
          "--arc-highlight-color": rootColors().highlight,
          "--arc-active-color": rootColors().active,
        }}
        class={styles.sunburst__arc}
        onMouseEnter={() => setHoverArcPath(diagramRoot().path)}
        onMouseLeave={() => setHoverArcPath(null)}
        onClick={() => navigate(getParentPath(diagramRoot().path))}
      />
    </Show>
  );
}
