import { arePathsEqual } from "../../../utils/zon";
import styles from "./ReportList.module.css";
import NumberOfLines from "./NumberOfLines";
import DisplayName, { ARROW_BEFORE } from "./DisplayName";
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
      return "";
    }

    if (arePathsEqual(listRoot().path, diagramRootPath())) {
      return ARROW_BEFORE.LEFT;
    } else {
      return ARROW_BEFORE.RIGHT;
    }
  }

  function hoverBeforeContent() {
    return !isListRootReportRoot() ? ARROW_BEFORE.LEFT : "";
  }

  return (
    <h2 class={styles["report-list__list-text-row"]}>
      <DisplayName
        style={{
          "--before-content": beforeContent(),
          "--hover-before-content": hoverBeforeContent(),
        }}
        node={listRoot()}
      />
      <NumberOfLines numberOfLines={listRoot().numberOfLines} />
    </h2>
  );
}
