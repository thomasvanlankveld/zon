import { ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { JSX } from "solid-js/h/jsx-runtime";
import { getDisplayName, type Node } from "../../../utils/zon";
import styles from "./ListItem.module.css";

type ListItemProps = {
  component: ValidComponent;
  class?: string;
  style?: JSX.CSSProperties;
  onMouseEnter?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  onMouseLeave?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  node: Node;
};

export default function ListItem(props: ListItemProps) {
  return (
    <Dynamic
      component={props.component}
      class={`${styles["list-item"]} ${props.class}`}
      style={{ ...props.style }}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onClick={props.onClick}
    >
      <span class={styles["list-item__display-name"]}>
        {getDisplayName(props.node.name)}
      </span>
      <span class={styles["list-item__number-of-lines"]}>
        {props.node.numberOfLines} lines
      </span>
    </Dynamic>
  );
}
