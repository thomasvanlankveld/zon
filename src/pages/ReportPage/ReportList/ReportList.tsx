import { createEffect, createMemo, createSignal, For } from "solid-js";
import {
  getNodeByPath,
  NODE_TYPE,
  getPathString,
  getDisplayName,
} from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";
import ListItem from "./ListItem";
import styles from "./ReportList.module.css";
import ListHeading from "./ListHeading";
import { useReportStore } from "../ReportPage.store";

export default function ReportList() {
  const { t } = useI18n();
  const {
    reportRoot,
    diagramRootPath,
    listRootPath,
    highlightedListPath,
    setHoverListPath,
    setSelectedRootPath,
  } = useReportStore();

  const [showGroup, setShowGroup] = createSignal(false);

  createEffect((prevRoot) => {
    if (prevRoot !== listRootPath()) {
      setShowGroup(false);
    }
    return listRootPath();
  });

  // Select root node for the list view (either root or the file of the hovered arc)
  const listRoot = createMemo(() =>
    listRootPath() != null
      ? getNodeByPath(reportRoot(), listRootPath())
      : reportRoot(),
  );

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

    const lastChild = root.children.at(-1);

    if (lastChild?.type !== NODE_TYPE.GROUP || !showGroup()) {
      return root.children;
    }

    const directChildren = root.children.slice(0, -1);
    const { groupedChildren } = lastChild;

    return [...directChildren, ...groupedChildren];
  };

  return (
    <div class={styles["report-list"]}>
      {/* TODO: Maybe this shouldn't be a nav? Check https://a11y-style-guide.com/style-guide/section-navigation.html */}
      <nav
        class={styles["report-list__nav"]}
        aria-label={t("report-list.nav.label", {
          name: getDisplayName(listRoot().name, t("group-name")),
        })}
      >
        <ListHeading
          listRoot={listRoot()}
          reportRootPath={reportRoot().path}
          diagramRootPath={diagramRootPath()}
          highlightedPath={highlightedListPath()}
          setHoverListPath={setHoverListPath}
          setSelectedRootPath={setSelectedRootPath}
        />
        <For each={listNodes()}>
          {(child) => (
            <ListItem
              node={child}
              setHoverListPath={setHoverListPath}
              setSelectedRootPath={setSelectedRootPath}
              setShowGroup={setShowGroup}
            />
          )}
        </For>
      </nav>
    </div>
  );
}
