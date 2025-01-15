import { createMemo, Setter, Show } from "solid-js";
import {
  arePathsEqual,
  getParentPath,
  Path,
  type Node,
} from "../../../utils/zon";
import resetButtonStyles from "../../../styles/reset-button.module.css";
import styles from "./ReportList.module.css";
import ListHeadingContent from "./ListHeadingContent";

type ListHeadingProps = {
  listRoot: Node;
  reportRootPath: Path;
  diagramRootPath: Path;
  highlightedPath: Path | null;
  setHoverListPath: Setter<Path | null>;
  setSelectedRootPath: Setter<Path | null>;
};

export default function ListHeading(props: ListHeadingProps) {
  const isReportRoot = createMemo(() =>
    arePathsEqual(props.listRoot.path, props.reportRootPath),
  );

  function onHeadingClick() {
    const target = isReportRoot() ? null : getParentPath(props.listRoot.path);

    props.setSelectedRootPath(target);
  }

  function isButton() {
    return !isReportRoot();
  }

  return (
    <Show
      when={isButton()}
      fallback={
        <ListHeadingContent
          isReportRoot={isReportRoot()}
          listRoot={props.listRoot}
          diagramRootPath={props.diagramRootPath}
          highlightedPath={props.highlightedPath}
          setHoverListPath={props.setHoverListPath}
        />
      }
    >
      <button
        class={`${resetButtonStyles["reset-button"]} ${styles["report-list__button"]}`}
        onClick={() => onHeadingClick()}
      >
        <ListHeadingContent
          isReportRoot={isReportRoot()}
          listRoot={props.listRoot}
          diagramRootPath={props.diagramRootPath}
          highlightedPath={props.highlightedPath}
          setHoverListPath={props.setHoverListPath}
        />
      </button>
    </Show>
  );
}
