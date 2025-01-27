import { For } from "solid-js";
import { getNodeStaticTextColors } from "../../../../utils/zon";
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
  const { reportRoot, listRoot, hoverListLanguage, setHoverListLanguage } =
    useReportState();

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

  function isRowDimmed(languageName: LanguageType) {
    if (hoverListLanguage() == null) {
      return false;
    }

    return hoverListLanguage() !== languageName;
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
            isDimmed={isRowDimmed(languageName as LanguageType)}
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
