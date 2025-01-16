import { Dynamic } from "solid-js/web";
import { NODE_TYPE, type Node } from "../../../utils/zon";
import resetButtonStyles from "../../../styles/reset-button.module.css";
import styles from "./ReportList.module.css";
import ListItemContent from "./ListItemContent";
import { useReportStore } from "../ReportPage.store";
import Underline from "./Underline";

type ListItemProps = {
  node: Node;
  numberOfLinesInRoot: number;
};

export default function ListItem(props: ListItemProps) {
  const { navigate, setHoverListPath, expandGroup } = useReportStore();

  function isButton() {
    return (
      props.node.type === NODE_TYPE.FOLDER ||
      props.node.type === NODE_TYPE.GROUP
    );
  }

  function onClick() {
    if (props.node.type === NODE_TYPE.GROUP) {
      expandGroup();
    } else if (props.node.type === NODE_TYPE.FOLDER) {
      navigate(props.node.path);
    }
  }

  return (
    <Dynamic
      component={isButton() ? "button" : "div"}
      classList={{
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
      <ListItemContent node={props.node} />
      <Underline
        node={props.node}
        numberOfLinesInRoot={props.numberOfLinesInRoot}
      />
    </Dynamic>
  );
}
