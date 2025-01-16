import { useI18n } from "../../../utils/i18n";
import { getDisplayName, type Node, NODE_TYPE } from "../../../utils/zon";
import DisplayName, { ARROW } from "./DisplayName";
import NumberOfLines from "./NumberOfLines";
import styles from "./ReportList.module.css";

type ListItemContentProps = {
  node: Node;
  numberOfLinesInRoot: number;
};

export default function ListItemContent(props: ListItemContentProps) {
  const { t } = useI18n();

  function hoverBeforeContent() {
    return props.node.type === NODE_TYPE.FOLDER
      ? ARROW.BEFORE.RIGHT
      : ARROW.EMPTY;
  }

  function hoverAfterContent() {
    return props.node.type === NODE_TYPE.GROUP ? ARROW.AFTER.DOWN : ARROW.EMPTY;
  }

  function nonBarWidth() {
    return `${100 - (props.node.numberOfLines / props.numberOfLinesInRoot) * 100}%`;
  }

  function dataText() {
    const before = hoverBeforeContent().PLAIN;
    const displayName = getDisplayName(props.node.name, t("group-name"));
    const separator = props.node.type === NODE_TYPE.FOLDER ? " /" : "";
    const after = hoverAfterContent().PLAIN;

    return `${before}${displayName}${separator}${after}`;
  }

  return (
    <span
      class={styles["report-list__list-text-row"]}
      style={{
        "--non-bar-width": nonBarWidth(),
      }}
      data-text={dataText()}
    >
      <DisplayName
        style={{
          "--hover-before-content": hoverBeforeContent().CONTENT,
          "--hover-after-content": hoverAfterContent().CONTENT,
        }}
        node={props.node}
      />
      <NumberOfLines numberOfLines={props.node.numberOfLines} />
    </span>
  );
}
