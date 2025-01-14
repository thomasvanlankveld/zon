import { Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { JSX } from "solid-js/h/jsx-runtime";
import { useI18n } from "../../../../utils/i18n";
import { getDisplayName, NODE_TYPE, type Node } from "../../../../utils/zon";
import resetButtonStyles from "../../../../styles/reset-button.module.css";
import styles from "./ListItem.module.css";

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
  const { t, formatNumber } = useI18n();

  return (
    <Dynamic
      component={props.component}
      class={`${styles["list-item"]} ${props.class}`}
      classList={{
        [resetButtonStyles["reset-button"]]: props.component === "button",
        [styles["list-item__button"]]: props.component === "button",
      }}
      style={{ ...props.style }}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onClick={props.onClick}
    >
      <span
        classList={{
          [styles["list-item__display-name"]]: true,
          [styles["list-item__display-name--with-left-arrow"]]:
            props.arrowDirection === ARROW_DIRECTION.LEFT,
          [styles["list-item__display-name--with-right-arrow"]]:
            props.arrowDirection === ARROW_DIRECTION.RIGHT,
          [styles["list-item__display-name--with-down-arrow"]]:
            props.arrowDirection === ARROW_DIRECTION.DOWN,
        }}
      >
        {getDisplayName(props.node.name, t("group-name"))}
        <Show when={props.node.type === NODE_TYPE.FOLDER}>
          <span class={styles["list-item__folder-separator"]}> /</span>
        </Show>
      </span>
      <span class={styles["list-item__number-of-lines"]}>
        {t("list-item.number-of-lines", {
          numberOfLines: formatNumber(props.node.numberOfLines),
        })}
      </span>
    </Dynamic>
  );
}
