import { JSX } from "solid-js";
import { TabKey, Tabs } from "./report-tabs";
import TabPanel from "../../../../components/Tabs/TabPanel";

type ReportTabPanelProps = {
  tab: TabKey;
  selectedTab: TabKey;
  class?: string;
  children: JSX.Element;
};

export default function ReportTabPanel(props: ReportTabPanelProps) {
  return (
    <TabPanel
      id={Tabs[props.tab].panelId}
      class={props.class}
      tabId={Tabs[props.tab].tabId}
      selected={props.selectedTab === props.tab}
    >
      {props.children}
    </TabPanel>
  );
}
