import ReportTabPanel from "../Tabs/ReportTabPanel";
import styles from "../ReportList.module.css";
import { For } from "solid-js";
import ListRow from "../ListRow/ListRow";
import { TabKey } from "../Tabs/report-tabs";
import { getNodeStaticTextColors, LINE_TYPE } from "../../../../utils/zon";
import { useReportState } from "../../ReportPage.state";
import { useI18n } from "../../../../utils/i18n";

type LineTypePanelProps = {
  selectedTab: TabKey;
};

export default function LineTypePanel(props: LineTypePanelProps) {
  const { t } = useI18n();
  const { reportRoot, listRoot, setHoverListLineType } = useReportState();

  const LineTypeNames = {
    [LINE_TYPE.CODE]: t("line-type.code"),
    [LINE_TYPE.COMMENTS]: t("line-type.comments"),
    [LINE_TYPE.BLANKS]: t("line-type.blanks"),
  };

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
      tab={TabKey.Types}
      selectedTab={props.selectedTab}
    >
      <For each={Object.values(LINE_TYPE)}>
        {(lineType) => (
          <ListRow
            colors={colors()}
            name={LineTypeNames[lineType]}
            numberOfLinesInRow={listRoot().stats[lineType]}
            numberOfLinesInRoot={listRoot().numberOfLines}
            onMouseEnter={[setHoverListLineType, lineType]}
            onMouseLeave={[setHoverListLineType, null]}
          />
        )}
      </For>
    </ReportTabPanel>
  );
}
