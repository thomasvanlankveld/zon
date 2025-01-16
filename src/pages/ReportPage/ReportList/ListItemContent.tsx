import { type Node, NODE_TYPE } from "../../../utils/zon";
import DisplayName, { ARROW_AFTER, ARROW_BEFORE } from "./DisplayName";
import NumberOfLines from "./NumberOfLines";

type ListItemContentProps = {
  node: Node;
};

export default function ListItemContent(props: ListItemContentProps) {
  function hoverBeforeContent() {
    return props.node.type === NODE_TYPE.FOLDER ? ARROW_BEFORE.RIGHT : "";
  }

  function hoverAfterContent() {
    return props.node.type === NODE_TYPE.GROUP ? ARROW_AFTER.DOWN : "";
  }

  return (
    <>
      <DisplayName
        style={{
          "--hover-before-content": hoverBeforeContent(),
          "--hover-after-content": hoverAfterContent(),
        }}
        node={props.node}
      />
      <NumberOfLines numberOfLines={props.node.numberOfLines} />
    </>
  );
}
