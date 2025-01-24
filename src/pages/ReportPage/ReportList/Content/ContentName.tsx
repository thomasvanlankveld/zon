import { Show } from "solid-js";
import styles from "../ReportList.module.css";
import { getDisplayName, isFolder, type Node } from "../../../../utils/zon";
import { useI18n } from "../../../../utils/i18n";

type ContentNameProps = {
  node: Node;
};

export default function ContentName(props: ContentNameProps) {
  const { t } = useI18n();

  return (
    <>
      {getDisplayName(props.node.name, t("group-name"))}
      <Show when={isFolder(props.node)}>
        <span class={styles["report-list__folder-separator"]}> /</span>
      </Show>
    </>
  );
}
