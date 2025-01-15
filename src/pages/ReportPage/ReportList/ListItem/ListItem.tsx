import { Dynamic } from "solid-js/web";
import { NODE_TYPE, Path, type Node } from "../../../../utils/zon";
import resetButtonStyles from "../../../../styles/reset-button.module.css";
import styles from "./ListItem.module.css";
import NumberOfLines from "./NumberOfLines";
import DisplayName from "./DisplayName";
import { Setter } from "solid-js";

type ListItemProps = {
  node: Node;
  setHoverListPath: Setter<Path | null>;
  setSelectedRootPath: Setter<Path | null>;
  setShowGroup: Setter<boolean>;
};

export default function ListItem(props: ListItemProps) {
  function hoverAfterContent() {
    if (props.node.type === NODE_TYPE.FOLDER) {
      return '" ->"';
    }

    if (props.node.type === NODE_TYPE.GROUP) {
      return '" ↓"';
    }

    return "";
  }

  function isButton() {
    return (
      props.node.type === NODE_TYPE.FOLDER ||
      props.node.type === NODE_TYPE.GROUP
    );
  }

  function onClick() {
    if (props.node.type === NODE_TYPE.GROUP) {
      props.setShowGroup(true);
    } else if (props.node.type === NODE_TYPE.FOLDER) {
      props.setSelectedRootPath(props.node.path);
    }
  }

  return (
    <Dynamic
      component={isButton() ? "button" : "span"}
      classList={{
        [styles["list-item"]]: true,
        [resetButtonStyles["reset-button"]]: isButton(),
        [styles["list-item__button"]]: isButton(),
      }}
      style={{
        "--base-color": props.node.colors.default,
        "--highlighted-color": props.node.colors.highlighted,
        "--pressed-color": props.node.colors.pressed,
      }}
      onMouseEnter={[props.setHoverListPath, props.node.path]}
      onMouseLeave={[props.setHoverListPath, null]}
      onClick={() => onClick()}
    >
      <DisplayName
        style={{ "--hover-after-content": hoverAfterContent() }}
        node={props.node}
      />
      <NumberOfLines numberOfLines={props.node.numberOfLines} />
    </Dynamic>
  );
}
