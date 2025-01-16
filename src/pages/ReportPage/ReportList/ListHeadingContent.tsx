import { arePathsEqual } from "../../../utils/zon";
import styles from "./ReportList.module.css";
import NumberOfLines from "./NumberOfLines";
import DisplayName, { ARROW_BEFORE } from "./DisplayName";
import { getBaseColor } from "../../../utils/zon/color";
import { useReportStore } from "../ReportPage.store";

export default function ListHeadingContent() {
  const {
    listRoot,
    isListRootReportRoot,
    diagramRootPath,
    highlightedListPath,
    setHoverListPath,
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
    <h2
      class={`${styles["report-list__heading"]} ${styles["report-list__list-text-row"]}`}
      style={{
        "--base-color": getBaseColor(
          listRoot().colors,
          listRoot().path,
          highlightedListPath(),
        ),
        "--highlighted-color": listRoot().colors.highlighted,
        "--pressed-color": listRoot().colors.pressed,
      }}
      onMouseEnter={() => setHoverListPath(listRoot().path)}
      onMouseLeave={() => setHoverListPath(null)}
    >
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
