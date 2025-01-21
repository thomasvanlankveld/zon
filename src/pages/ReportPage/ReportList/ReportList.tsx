import { For } from "solid-js";
import { getDisplayName, isFile, isGroup, isFolder } from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";
import ListItem from "./ListItem";
import styles from "./ReportList.module.css";
import ListHeading from "./ListHeading";
import { useReportState } from "../ReportPage.state";

export default function ReportList() {
  const { t } = useI18n();
  const { listRoot } = useReportState();

  const listNodes = () => {
    const root = listRoot();

    if (isFile(root)) {
      return [];
    }

    if (isGroup(root)) {
      return root.groupedChildren;
    }

    if (isFolder(root)) {
      return root.children;
    }

    throw new Error(`Node has unknown type`);
  };

  return (
    <div class="overflow-x-hidden">
      {/* TODO: Maybe this shouldn't be a nav? Check https://a11y-style-guide.com/style-guide/section-navigation.html */}
      <nav
        class={`${styles["report-list__list"]} overflow-x-hidden`}
        aria-label={t("report-list.nav.label", {
          name: getDisplayName(listRoot().name, t("group-name")),
        })}
      >
        <ListHeading />
        <div class={styles["report-list__list"]}>
          <For each={listNodes()}>
            {(child) => (
              <ListItem
                node={child}
                numberOfLinesInRoot={listRoot().numberOfLines}
              />
            )}
          </For>
        </div>
      </nav>
    </div>
  );
}
