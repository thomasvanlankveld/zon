import { TabKey } from "../Tabs/report-tabs";
import ReportTabPanel from "../Tabs/ReportTabPanel";
import styles from "../ReportList.module.css";

type LanguagePanelProps = {
  selectedTab: TabKey;
};

export default function LanguagePanel(props: LanguagePanelProps) {
  return (
    <ReportTabPanel
      class={styles["report-list__list"]}
      tab={TabKey.Languages}
      selectedTab={props.selectedTab}
    >
      Language information here
    </ReportTabPanel>
  );
}
