import { isFolder, isGroup, type Node } from "../../../utils/zon";
import { useReportState } from "../ReportPage.state";
import ListRow from "./ListRow";
import { ARROW } from "./DisplayName";

type ListItemProps = {
  node: Node;
  numberOfLinesInRoot: number;
};

export default function ListItem(props: ListItemProps) {
  const { navigate, expandGroup } = useReportState();

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
      node={props.node}
      numberOfLinesInRoot={props.numberOfLinesInRoot}
      nameHoverBeforeContent={nameHoverBeforeContent()}
      nameHoverAfterContent={nameHoverAfterContent()}
      onClick={maybeOnListItemClick()}
    />
  );
}
