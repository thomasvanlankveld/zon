import { createMemo, Show } from "solid-js";
import { DIAGRAM_ROOT_COLORS, getBaseColor } from "../../../utils/zon/color";
import { arePathsEqual, getParentPath } from "../../../utils/zon";
import { useReportStore } from "../ReportPage.store";
import styles from "./Arc.module.css";

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
  } = useReportStore();

  const isReportRoot = createMemo(() =>
    arePathsEqual(diagramRoot().path, reportRoot().path),
  );

  const rootColors = createMemo(() => {
    if (isReportRoot()) {
      return { base: "", highlight: "", press: "" };
    }

    const staticColors = DIAGRAM_ROOT_COLORS;

    return {
      base: getBaseColor(
        staticColors,
        diagramRoot().path,
        highlightedDiagramPath(),
      ),
      highlight: staticColors.highlight,
      press: staticColors.press,
    };
  });

  return (
    <Show when={!isReportRoot()}>
      <circle
        cx={0}
        cy={0}
        r={props.radius}
        style={{
          "--arc-base-color": rootColors().base,
          "--arc-highlight-color": rootColors().highlight,
          "--arc-press-color": rootColors().press,
        }}
        class={styles.sunburst__arc}
        onMouseEnter={() => setHoverArcPath(diagramRoot().path)}
        onMouseLeave={() => setHoverArcPath(null)}
        onClick={() => navigate(getParentPath(diagramRoot().path))}
      />
    </Show>
  );
}
