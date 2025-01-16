import { For } from "solid-js";
import { NODE_TYPE, getPathString, getDisplayName } from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";
import ListItem from "./ListItem";
import styles from "./ReportList.module.css";
import ListHeading from "./ListHeading";
import { useReportStore } from "../ReportPage.store";

export default function ReportList() {
  const { t } = useI18n();
  const { listRoot } = useReportStore();

  const listNodes = () => {
    const root = listRoot();

    if (root.type === NODE_TYPE.FILE) {
      return [];
    }

    if (root.type === NODE_TYPE.GROUP) {
      return root.groupedChildren;
    }

    if (root.type !== NODE_TYPE.FOLDER) {
      throw new Error(
        `Node "${getPathString(root.path)}" has unknown type ${root.type.toString()}`,
      );
    }

    return root.children;
  };

  return (
    <div class={styles["report-list"]}>
      {/* TODO: Maybe this shouldn't be a nav? Check https://a11y-style-guide.com/style-guide/section-navigation.html */}
      <nav
        class={styles["report-list__list"]}
        aria-label={t("report-list.nav.label", {
          name: getDisplayName(listRoot().name, t("group-name")),
        })}
      >
        <ListHeading />
        <For each={listNodes()}>
          {(child) => (
            <ListItem
              node={child}
              numberOfLinesInRoot={listRoot().numberOfLines}
            />
          )}
        </For>
      </nav>
    </div>
  );
}
