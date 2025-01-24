import { For } from "solid-js";
import { getNodeStaticTextColors } from "../../../../utils/zon";
import { useReportState } from "../../ReportPage.state";
import { TabKey } from "../Tabs/report-tabs";
import ReportTabPanel from "../Tabs/ReportTabPanel";
import ListRow from "../ListRow/ListRow";
import styles from "../ReportList.module.css";

type LanguagePanelProps = {
  selectedTab: TabKey;
};

export default function LanguagePanel(props: LanguagePanelProps) {
  const { reportRoot, listRoot } = useReportState();

  function languageCounts() {
    return Object.entries(listRoot().languageCounts).toSorted(
      (left, right) => right[1] - left[1],
    );
  }

  function colors() {
    const staticColors = getNodeStaticTextColors(listRoot(), reportRoot().path);

    return {
      ...staticColors,
      base: staticColors.default,
    };
  }

  return (
    <ReportTabPanel
      class={styles["report-list__list"]}
      tab={TabKey.Languages}
      selectedTab={props.selectedTab}
    >
      <For each={languageCounts()}>
        {([languageName, numberOfLines]) => (
          <ListRow
            colors={colors()}
            name={languageName}
            numberOfLinesInRow={numberOfLines}
            numberOfLinesInRoot={listRoot().numberOfLines}
          />
        )}
      </For>
    </ReportTabPanel>
  );
}
