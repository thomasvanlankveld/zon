import {
  getNodeTextColors,
  isFolder,
  isGroup,
  type Node,
} from "../../../utils/zon";
import { useReportState } from "../ReportPage.state";
import ListRow from "./ListRow";
import { ARROW } from "../../../styles/arrow";
import ContentName from "./ContentName";

type ListItemProps = {
  node: Node;
  numberOfLinesInRoot: number;
};

export default function ListItem(props: ListItemProps) {
  const {
    reportRoot,
    navigate,
    expandGroup,
    highlightedListPath,
    setHoverListPath,
  } = useReportState();

  function nameHoverBeforeContent() {
    return isFolder(props.node) ? ARROW.BEFORE.RIGHT : ARROW.EMPTY;
  }

  function nameHoverAfterContent() {
    return isGroup(props.node) ? ARROW.AFTER.DOWN : ARROW.EMPTY;
  }

  function maybeOnListItemClick() {
    if (isGroup(props.node)) {
      return expandGroup;
    }

    if (isFolder(props.node)) {
      return navigate.bind(null, props.node.path);
    }
  }

  return (
    <ListRow
      colors={getNodeTextColors(
        props.node,
        reportRoot().path,
        highlightedListPath(),
      )}
      name={<ContentName node={props.node} />}
      nameHoverBeforeContent={nameHoverBeforeContent()}
      nameHoverAfterContent={nameHoverAfterContent()}
      numberOfLinesInRow={props.node.numberOfLines}
      numberOfLinesInRoot={props.numberOfLinesInRoot}
      onMouseEnter={[setHoverListPath, props.node.path]}
      onMouseLeave={[setHoverListPath, null]}
      onClick={maybeOnListItemClick()}
    />
  );
}
