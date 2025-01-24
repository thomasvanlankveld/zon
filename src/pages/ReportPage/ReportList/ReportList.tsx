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
import ReportTabList from "./Tabs/ReportTabList";
import ListRow from "./ListRow/ListRow";
import { TabKey } from "./Tabs/report-tabs";
import ReportTabPanel from "./Tabs/ReportTabPanel";

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
        <ReportTabPanel
          class={styles["report-list__list"]}
          tab={TabKey.Content}
          selectedTab={selectedTab()}
        >
          <For each={listNodes()}>
            {(child) => (
              <ContentRow
                node={child}
                numberOfLinesInRoot={listRoot().numberOfLines}
              />
            )}
          </For>
        </ReportTabPanel>
        <ReportTabPanel
          class={styles["report-list__list"]}
          tab={TabKey.Types}
          selectedTab={selectedTab()}
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
        </ReportTabPanel>
        <ReportTabPanel
          class={styles["report-list__list"]}
          tab={TabKey.Languages}
          selectedTab={selectedTab()}
        >
          Language information here
        </ReportTabPanel>
      </nav>
    </div>
  );
}
