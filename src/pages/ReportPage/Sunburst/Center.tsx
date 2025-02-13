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
    isCenterHighlighted,
    isCenterDeemphasized,
    setHoverArcPath,
  } = useReportState();

  const isReportRoot = createMemo(() =>
    arePathsEqual(diagramRoot().path, reportRoot().path),
  );

  return (
    <Show
      when={!isReportRoot()}
      fallback={
        <circle cx={0} cy={0} r={props.radius} fill="var(--color-background)" />
      }
    >
      <circle
        cx={0}
        cy={0}
        r={props.radius}
        style={{
          "--color-arc-regular": "var(--color-diagram-root-regular)",
          "--color-arc-highlight": "var(--color-diagram-root-highlight)",
          "--color-arc-active": "var(--color-diagram-root-active)",
          "--color-arc-deemphasize": "var(--color-diagram-root-deemphasize)",
        }}
        class={styles.sunburst__arc}
        data-highlighted={isCenterHighlighted()}
        data-deemphasized={isCenterDeemphasized()}
        onMouseEnter={() => setHoverArcPath(diagramRoot().path)}
        onMouseLeave={() => setHoverArcPath(null)}
        onClick={() => navigate(getParentPath(diagramRoot().path))}
      />
    </Show>
  );
}
