import { useTranslations } from "../utils/translations";

type CountingLinesProps = {
  path: string;
};

export default function CountingLines(props: CountingLinesProps) {
  const { t } = useTranslations();

  return <p>{t("counting-lines.text", { path: props.path })}</p>;
}
