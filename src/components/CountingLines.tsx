import { useI18n } from "../utils/i18n";

type CountingLinesProps = {
  path: string;
};

export default function CountingLines(props: CountingLinesProps) {
  const { t } = useI18n();

  return <p>{t("counting-lines.text", { path: props.path })}</p>;
}
