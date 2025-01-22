import { useI18n } from "../utils/i18n";

type NumberOfLinesProps = {
  class?: string;
  numberOfLines: number;
};

export default function NumberOfLines(props: NumberOfLinesProps) {
  const { t, formatNumber } = useI18n();

  return (
    <span class={`${props.class ?? ""} whitespace-nowrap`}>
      {t("report-list.number-of-lines", {
        numberOfLines: formatNumber(props.numberOfLines),
      })}
    </span>
  );
}
