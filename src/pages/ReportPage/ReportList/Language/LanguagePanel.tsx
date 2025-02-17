import { For } from "solid-js";
import { rainbow } from "../../../../utils/zon";
import { LanguageType } from "../../../../utils/tokei";
import { useReportState } from "../../ReportPage.state";
import { TabKey } from "../Tabs/report-tabs";
import ReportTabPanel from "../Tabs/ReportTabPanel";
import ListRow from "../ListRow/ListRow";
import styles from "../ReportList.module.css";

type LanguagePanelProps = {
  selectedTab: TabKey;
};

export default function LanguagePanel(props: LanguagePanelProps) {
  const { listRoot, hoverListLanguage, setHoverListLanguage } =
    useReportState();

  function languageCounts() {
    return Object.entries(listRoot().languages).toSorted(
      (left, right) => right[1].numberOfLines - left[1].numberOfLines,
    );
  }

  function isRowDeemphasized(languageName: LanguageType) {
    if (hoverListLanguage() == null) {
      return false;
    }

    return hoverListLanguage() !== languageName;
  }

  return (
    <ReportTabPanel
      class={styles["report-list__tab-panel"]}
      tab={TabKey.Languages}
      selectedTab={props.selectedTab}
    >
      <For each={languageCounts()}>
        {([languageName, { colorValue, numberOfLines }]) => (
          <ListRow
            colors={rainbow(colorValue)}
            name={languageName}
            isDeemphasized={isRowDeemphasized(languageName as LanguageType)}
            numberOfLinesInRow={numberOfLines}
            numberOfLinesInRoot={listRoot().numberOfLines}
            onMouseEnter={[setHoverListLanguage, languageName]}
            onMouseLeave={[setHoverListLanguage, null]}
          />
        )}
      </For>
    </ReportTabPanel>
  );
}
