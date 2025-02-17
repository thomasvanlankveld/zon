import ReportTabPanel from "../Tabs/ReportTabPanel";
import styles from "../ReportList.module.css";
import { For } from "solid-js";
import ListRow from "../ListRow/ListRow";
import { TabKey } from "../Tabs/report-tabs";
import { LINE_TYPE, rainbow } from "../../../../utils/zon";
import { useReportState } from "../../ReportPage.state";
import { useI18n } from "../../../../utils/i18n";

type LineTypePanelProps = {
  selectedTab: TabKey;
};

export default function LineTypePanel(props: LineTypePanelProps) {
  const { t } = useI18n();
  const { listRoot, hoverListLineType, setHoverListLineType } =
    useReportState();

  const LineTypeNames = {
    [LINE_TYPE.CODE]: t("line-type.code"),
    [LINE_TYPE.COMMENTS]: t("line-type.comments"),
    [LINE_TYPE.BLANKS]: t("line-type.blanks"),
  };

  function isRowDeemphasized(lineType: LINE_TYPE) {
    if (hoverListLineType() == null) {
      return false;
    }

    return hoverListLineType() !== lineType;
  }

  return (
    <ReportTabPanel
      class={styles["report-list__tab-panel"]}
      tab={TabKey.Types}
      selectedTab={props.selectedTab}
    >
      <For each={Object.values(LINE_TYPE)}>
        {(lineType) => (
          <ListRow
            colors={rainbow(listRoot().lineTypes[lineType].colorValue)}
            name={LineTypeNames[lineType]}
            isDeemphasized={isRowDeemphasized(lineType)}
            numberOfLinesInRow={listRoot().lineTypes[lineType].numberOfLines}
            numberOfLinesInRoot={listRoot().numberOfLines}
            onMouseEnter={[setHoverListLineType, lineType]}
            onMouseLeave={[setHoverListLineType, null]}
          />
        )}
      </For>
    </ReportTabPanel>
  );
}
