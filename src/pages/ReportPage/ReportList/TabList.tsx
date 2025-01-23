import { For, Setter } from "solid-js";
import { ValueOf } from "../../../utils/type";
import { useI18n } from "../../../utils/i18n";
import styles from "./ReportList.module.css";
import Tab from "../../../components/Tabs/Tab";

export const TabKey = {
  Content: "content",
  Types: "types",
  Languages: "languages",
};
export type TabKey = ValueOf<typeof TabKey>;

export const Tabs = {
  [TabKey.Content]: {
    key: TabKey.Content,
    tabId: "content-tab",
    panelId: "content-panel",
    label: "content.label",
  },
  [TabKey.Types]: {
    key: TabKey.Types,
    tabId: "types-tab",
    panelId: "types-panel",
    label: "types.label",
  },
  [TabKey.Languages]: {
    key: TabKey.Languages,
    tabId: "languages-tab",
    panelId: "languages-panel",
    label: "languages.label",
  },
};

type TabListProps = {
  selectedTab: TabKey;
  setSelectedTab: Setter<TabKey>;
};

export default function TabList(props: TabListProps) {
  const { t } = useI18n();

  return (
    <div role="tablist" class={styles["report-list__tab-list"]}>
      <For each={Object.values(Tabs)}>
        {(tab) => (
          <Tab
            id={tab.tabId}
            panelId={tab.panelId}
            selected={props.selectedTab === tab.key}
            onClick={() => props.setSelectedTab(tab.key)}
          >
            {t(tab.label)}
          </Tab>
        )}
      </For>
    </div>
  );
}
