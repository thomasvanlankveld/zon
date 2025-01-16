import { Show } from "solid-js";
import { JSX } from "solid-js/h/jsx-runtime";
import styles from "./ReportList.module.css";
import { getDisplayName, type Node, NODE_TYPE } from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";

export const ARROW = {
  BEFORE: {
    LEFT: { PLAIN: "<- ", CONTENT: '"<- "' },
    RIGHT: { PLAIN: "-> ", CONTENT: '"-> "' },
  },
  AFTER: {
    DOWN: { PLAIN: " ↓", CONTENT: '" ↓"' },
  },
  EMPTY: { PLAIN: "", CONTENT: "" },
};

type DisplayNameProps = {
  style?: JSX.CSSProperties;
  node: Node;
};

export default function DisplayName(props: DisplayNameProps) {
  const { t } = useI18n();

  return (
    <span
      style={{ ...props.style }}
      class={styles["report-list__display-name"]}
    >
      {getDisplayName(props.node.name, t("group-name"))}
      <Show when={props.node.type === NODE_TYPE.FOLDER}>
        <span class={styles["report-list__folder-separator"]}> /</span>
      </Show>
    </span>
  );
}
