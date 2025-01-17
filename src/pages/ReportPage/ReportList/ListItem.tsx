import { NODE_TYPE, type Node } from "../../../utils/zon";
import { useReportStore } from "../ReportPage.store";
import ListRow from "./ListRow";
import { ARROW } from "./DisplayName";

type ListItemProps = {
  node: Node;
  numberOfLinesInRoot: number;
};

export default function ListItem(props: ListItemProps) {
  const { navigate, expandGroup } = useReportStore();

  function nameHoverBeforeContent() {
    return props.node.type === NODE_TYPE.FOLDER
      ? ARROW.BEFORE.RIGHT
      : ARROW.EMPTY;
  }

  function nameHoverAfterContent() {
    return props.node.type === NODE_TYPE.GROUP ? ARROW.AFTER.DOWN : ARROW.EMPTY;
  }

  function maybeOnListItemClick() {
    if (props.node.type === NODE_TYPE.GROUP) {
      return expandGroup;
    }

    if (props.node.type === NODE_TYPE.FOLDER) {
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
