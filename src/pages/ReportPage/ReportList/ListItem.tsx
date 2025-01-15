import { Dynamic } from "solid-js/web";
import { NODE_TYPE, type Node } from "../../../utils/zon";
import resetButtonStyles from "../../../styles/reset-button.module.css";
import styles from "./ReportList.module.css";
import NumberOfLines from "./NumberOfLines";
import DisplayName, { ARROW_AFTER, ARROW_BEFORE } from "./DisplayName";
import { useReportStore } from "../ReportPage.store";

type ListItemProps = {
  node: Node;
};

export default function ListItem(props: ListItemProps) {
  const { setSelectedRootPath, setHoverListPath, expandListGroup } =
    useReportStore();

  function hoverBeforeContent() {
    return props.node.type === NODE_TYPE.FOLDER ? ARROW_BEFORE.RIGHT : "";
  }

  function hoverAfterContent() {
    return props.node.type === NODE_TYPE.GROUP ? ARROW_AFTER.DOWN : "";
  }

  function isButton() {
    return (
      props.node.type === NODE_TYPE.FOLDER ||
      props.node.type === NODE_TYPE.GROUP
    );
  }

  function onClick() {
    if (props.node.type === NODE_TYPE.GROUP) {
      expandListGroup();
    } else if (props.node.type === NODE_TYPE.FOLDER) {
      setSelectedRootPath(props.node.path);
    }
  }

  return (
    <Dynamic
      component={isButton() ? "button" : "span"}
      classList={{
        [styles["report-list__list-item"]]: true,
        [resetButtonStyles["reset-button"]]: isButton(),
        [styles["report-list__button"]]: isButton(),
      }}
      style={{
        "--base-color": props.node.colors.default,
        "--highlighted-color": props.node.colors.highlighted,
        "--pressed-color": props.node.colors.pressed,
      }}
      onMouseEnter={[setHoverListPath, props.node.path]}
      onMouseLeave={[setHoverListPath, null]}
      onClick={() => onClick()}
    >
      <DisplayName
        style={{
          "--hover-before-content": hoverBeforeContent(),
          "--hover-after-content": hoverAfterContent(),
        }}
        node={props.node}
      />
      <NumberOfLines numberOfLines={props.node.numberOfLines} />
    </Dynamic>
  );
}
