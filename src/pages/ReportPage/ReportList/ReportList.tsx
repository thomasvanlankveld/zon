import { createSignal, For } from "solid-js";
import {
  getDisplayName,
  isFile,
  isGroup,
  isFolder,
  LINE_TYPE,
  getNodeStaticTextColors,
} from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";
import { useReportState } from "../ReportPage.state";
import ContentRow from "./Content/ContentRow";
import styles from "./ReportList.module.css";
import ListHeading from "./ListHeading";
import ReportTabList, { TabKey, Tabs } from "./Tabs/ReportTabList";
import TabPanel from "../../../components/Tabs/TabPanel";
import ListRow from "./ListRow/ListRow";

export default function ReportList() {
  const { t } = useI18n();
  const { reportRoot, listRoot } = useReportState();
  const [selectedTab, setSelectedTab] = createSignal<TabKey>(TabKey.Content);

  const LineTypeNames = {
    [LINE_TYPE.CODE]: t("line-type.code"),
    [LINE_TYPE.COMMENTS]: t("line-type.comments"),
    [LINE_TYPE.BLANKS]: t("line-type.blanks"),
  };

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

  function colors() {
    const staticColors = getNodeStaticTextColors(listRoot(), reportRoot().path);

    return {
      ...staticColors,
      base: staticColors.default,
    };
  }

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
        <ReportTabList
          selectedTab={selectedTab()}
          setSelectedTab={setSelectedTab}
        />
        <TabPanel
          id={Tabs[TabKey.Content].panelId}
          class={styles["report-list__list"]}
          tabId={Tabs[TabKey.Content].tabId}
          selected={selectedTab() === TabKey.Content}
        >
          <For each={listNodes()}>
            {(child) => (
              <ContentRow
                node={child}
                numberOfLinesInRoot={listRoot().numberOfLines}
              />
            )}
          </For>
        </TabPanel>
        <TabPanel
          id={Tabs[TabKey.Types].panelId}
          class={styles["report-list__list"]}
          tabId={Tabs[TabKey.Types].tabId}
          selected={selectedTab() === TabKey.Types}
        >
          <For each={Object.values(LINE_TYPE)}>
            {(lineType) => (
              <ListRow
                colors={colors()}
                name={LineTypeNames[lineType]}
                numberOfLinesInRow={listRoot().stats[lineType]}
                numberOfLinesInRoot={listRoot().numberOfLines}
              />
            )}
          </For>
        </TabPanel>
        <TabPanel
          id={Tabs[TabKey.Languages].panelId}
          class={styles["report-list__list"]}
          tabId={Tabs[TabKey.Languages].tabId}
          selected={selectedTab() === TabKey.Languages}
        >
          Language information here
        </TabPanel>
      </nav>
    </div>
  );
}
