import { arePathsEqual } from "../../../utils/zon";
import styles from "./ReportList.module.css";
import NumberOfLines from "./NumberOfLines";
import DisplayName, { ARROW } from "./DisplayName";
import { useReportStore } from "../ReportPage.store";

export default function ListHeadingContent() {
  const {
    listRoot,
    isListRootReportRoot,
    diagramRootPath,
    highlightedListPath,
  } = useReportStore();

  function beforeContent() {
    if (
      isListRootReportRoot() ||
      !arePathsEqual(listRoot().path, highlightedListPath())
    ) {
      return ARROW.EMPTY;
    }

    if (arePathsEqual(listRoot().path, diagramRootPath())) {
      return ARROW.BEFORE.LEFT;
    } else {
      return ARROW.BEFORE.RIGHT;
    }
  }

  function hoverBeforeContent() {
    return !isListRootReportRoot() ? ARROW.BEFORE.LEFT : ARROW.EMPTY;
  }

  return (
    <h2 class={styles["report-list__list-text-row"]}>
      <DisplayName
        style={{
          "--before-content": beforeContent().CONTENT,
          "--hover-before-content": hoverBeforeContent().CONTENT,
        }}
        node={listRoot()}
      />
      <NumberOfLines numberOfLines={listRoot().numberOfLines} />
    </h2>
  );
}
