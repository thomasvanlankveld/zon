import { Show } from "solid-js";
import { JSX } from "solid-js/h/jsx-runtime";
import styles from "./ReportList.module.css";
import { getDisplayName, isFolder, type Node } from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";

type DisplayNameProps = {
  style?: JSX.CSSProperties;
  node: Node;
};

export default function DisplayName(props: DisplayNameProps) {
  const { t } = useI18n();

  return (
    <span
      style={{ ...props.style }}
      class={`${styles["report-list__display-name"]} truncate`}
    >
      {getDisplayName(props.node.name, t("group-name"))}
      <Show when={isFolder(props.node)}>
        <span class={styles["report-list__folder-separator"]}> /</span>
      </Show>
    </span>
  );
}
