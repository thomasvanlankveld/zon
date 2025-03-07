import {
  arePathsEqual,
  getNodeByPath,
  getParentPath,
  isGroup,
} from "../../../utils/zon";
import styles from "./ReportList.module.css";
import { useReportState } from "../ReportPage.state";
import ListRow from "./ListRow/ListRow";
import { ARROW } from "../../../styles/arrow";
import ContentName from "./Content/ContentName";

type ListHeadingProps = {
  hasBottomMargin: boolean;
};

export default function ListHeading(props: ListHeadingProps) {
  const {
    reportRoot,
    navigate,
    diagramRootPath,
    listRoot,
    listRootPath,
    highlightedListPath,
    isListRootReportRoot,
    setHoverListPath,
    getNodeTextColors,
  } = useReportState();

  function numberOfLinesInRoot() {
    const root = isGroup(listRoot())
      ? getNodeByPath(reportRoot(), getParentPath(listRootPath()))
      : listRoot();

    return root.numberOfLines;
  }

  function nameBeforeContent() {
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
      colors={getNodeTextColors(listRoot())}
      rowContainerClassList={{
        "heading-regular": true,
        [styles["report-list__heading--bottom-margin"]]: props.hasBottomMargin,
      }}
      hasPadding={false}
      rowTextComponent={"h2"}
      name={<ContentName node={listRoot()} />}
      nameBeforeContent={nameBeforeContent()}
      nameHoverBeforeContent={nameHoverBeforeContent()}
      numberOfLinesInRow={listRoot().numberOfLines}
      numberOfLinesInRoot={numberOfLinesInRoot()}
      onMouseEnter={[setHoverListPath, listRoot().path]}
      onMouseLeave={[setHoverListPath, null]}
      onClick={maybeOnHeaderClick()}
    />
  );
}
