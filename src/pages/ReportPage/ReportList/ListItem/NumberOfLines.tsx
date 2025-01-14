import { useI18n } from "../../../../utils/i18n";
import styles from "./NumberOfLines.module.css";

type NumberOfLinesProps = {
  numberOfLines: number;
};

export default function NumberOfLines(props: NumberOfLinesProps) {
  const { t, formatNumber } = useI18n();

  return (
    <span
      style={{ "white-space": "nowrap" }}
      class={styles["list-item__number-of-lines"]}
    >
      {t("list-item.number-of-lines", {
        numberOfLines: formatNumber(props.numberOfLines),
      })}
    </span>
  );
}
