import { useI18n } from "../../../utils/i18n";
import styles from "./ReportList.module.css";

type NumberOfLinesProps = {
  numberOfLines: number;
};

export default function NumberOfLines(props: NumberOfLinesProps) {
  const { t, formatNumber } = useI18n();

  return (
    <span
      style={{ "white-space": "nowrap" }}
      class={styles["report-list__number-of-lines"]}
    >
      {t("report-list.number-of-lines", {
        numberOfLines: formatNumber(props.numberOfLines),
      })}
    </span>
  );
}
