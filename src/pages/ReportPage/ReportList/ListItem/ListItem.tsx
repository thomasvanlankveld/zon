import { Dynamic } from "solid-js/web";
import { JSX } from "solid-js/h/jsx-runtime";
import { type Node } from "../../../../utils/zon";
import resetButtonStyles from "../../../../styles/reset-button.module.css";
import styles from "./ListItem.module.css";
import NumberOfLines from "./NumberOfLines";
import DisplayName from "./DisplayName";

type ListItemProps = {
  component?: "button" | "span";
  class?: string;
  style?: JSX.CSSProperties;
  arrowDirection?: ArrowDirection;
  onMouseEnter?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  onMouseLeave?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  node: Node;
};

export const ARROW_DIRECTION = {
  LEFT: "left",
  RIGHT: "right",
  DOWN: "down",
} as const;
export type ArrowDirection =
  (typeof ARROW_DIRECTION)[keyof typeof ARROW_DIRECTION];

export default function ListItem(props: ListItemProps) {
  function hoverBeforeContent() {
    return props.arrowDirection === ARROW_DIRECTION.LEFT ? '"<- "' : "";
  }

  function hoverAfterContent() {
    if (props.arrowDirection === ARROW_DIRECTION.RIGHT) {
      return '" ->"';
    }

    if (props.arrowDirection === ARROW_DIRECTION.DOWN) {
      return '" ↓"';
    }

    return "";
  }

  return (
    <Dynamic
      component={props.component}
      class={`${styles["list-item"]} ${props.class}`}
      classList={{
        [resetButtonStyles["reset-button"]]: props.component === "button",
        [styles["list-item__button"]]: props.component === "button",
      }}
      style={{
        ...props.style,
      }}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onClick={props.onClick}
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
