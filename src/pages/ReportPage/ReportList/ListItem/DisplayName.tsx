import { Show } from "solid-js";
import styles from "./ListItem.module.css";
import { getDisplayName, type Node, NODE_TYPE } from "../../../../utils/zon";
import { useI18n } from "../../../../utils/i18n";

export const ARROW_DIRECTION = {
  LEFT: "left",
  RIGHT: "right",
  DOWN: "down",
} as const;
export type ArrowDirection =
  (typeof ARROW_DIRECTION)[keyof typeof ARROW_DIRECTION];

type DisplayNameProps = {
  arrowDirection?: ArrowDirection;
  node: Node;
};

export default function DisplayName(props: DisplayNameProps) {
  const { t } = useI18n();

  return (
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
  );
}
