import {
  arePathsEqual,
  getNodeByPath,
  getParentPath,
  NODE_TYPE,
} from "../../../utils/zon";
import styles from "./ReportList.module.css";
import { useReportStore } from "../ReportPage.store";
import ListRow from "./ListRow";
import { ARROW } from "./DisplayName";

export default function ListHeading() {
  const {
    reportRoot,
    navigate,
    diagramRootPath,
    listRoot,
    listRootPath,
    highlightedListPath,
    isListRootReportRoot,
  } = useReportStore();

  function numberOfLinesInRoot() {
    const root =
      listRoot().type === NODE_TYPE.GROUP
        ? getNodeByPath(reportRoot(), getParentPath(listRootPath()))
        : listRoot();

    return root.numberOfLines;
  }

  function nameBeforeContent() {
    if (
      isListRootReportRoot() ||
      !arePathsEqual(listRoot().path, highlightedListPath())
    ) {
      return "";
    }

    if (arePathsEqual(listRoot().path, diagramRootPath())) {
      return ARROW.BEFORE.LEFT;
    } else {
      return ARROW.BEFORE.RIGHT;
    }
  }

  function nameHoverBeforeContent() {
    return !isListRootReportRoot() ? ARROW.BEFORE.LEFT : ARROW.EMPTY;
  }

  function maybeOnHeaderClick() {
    if (isListRootReportRoot()) {
      return;
    }

    const parentPath = getParentPath(listRootPath());
    return navigate.bind(null, parentPath);
  }

  return (
    <ListRow
      node={listRoot()}
      numberOfLinesInRoot={numberOfLinesInRoot()}
      rowContainerClassList={{
        "text-l": true,
        [styles["report-list__heading"]]: true,
      }}
      rowContentComponent={"h2"}
      nameBeforeContent={nameBeforeContent()}
      nameHoverBeforeContent={nameHoverBeforeContent()}
      onClick={maybeOnHeaderClick()}
    />
  );
}
