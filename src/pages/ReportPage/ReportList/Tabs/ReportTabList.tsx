import { For, Setter } from "solid-js";
import { useI18n } from "../../../../utils/i18n";
import Tab from "../../../../components/Tabs/Tab";
import TabList from "../../../../components/Tabs/TabList";
import { TabKey, Tabs } from "./report-tabs";

type TabListProps = {
  selectedTab: TabKey;
  setSelectedTab: Setter<TabKey>;
};

export default function ReportTabList(props: TabListProps) {
  const { t } = useI18n();

  return (
    <TabList>
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
    </TabList>
  );
}
