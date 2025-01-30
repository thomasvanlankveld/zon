import { createMemo, Show } from "solid-js";
import { arePathsEqual, getParentPath } from "../../../utils/zon";
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
    isArcHighlighted,
    isArcDeemphasized,
    setHoverArcPath,
  } = useReportState();

  const isReportRoot = createMemo(() =>
    arePathsEqual(diagramRoot().path, reportRoot().path),
  );

  return (
    <Show when={!isReportRoot()}>
      <circle
        cx={0}
        cy={0}
        r={props.radius}
        style={{
          "--arc-regular-color": "var(--color-diagram-root-regular)",
          "--arc-highlight-color": "var(--color-diagram-root-highlight)",
          "--arc-active-color": "var(--color-diagram-root-active)",
          "--arc-deemphasize-color": "var(--color-diagram-root-deemphasize)",
        }}
        class={styles.sunburst__arc}
        data-highlighted={isArcHighlighted(diagramRoot())}
        data-deemphasized={isArcDeemphasized(diagramRoot())}
        onMouseEnter={() => setHoverArcPath(diagramRoot().path)}
        onMouseLeave={() => setHoverArcPath(null)}
        onClick={() => navigate(getParentPath(diagramRoot().path))}
      />
    </Show>
  );
}
