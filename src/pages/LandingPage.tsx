import { Show } from "solid-js";
import UploadButton from "../components/UploadButton/UploadButton";
import CountingLines from "../components/CountingLines";
import { useTranslations } from "../utils/translations";

type LandingPageProps = {
  isLoading: boolean;
  path?: string;
  countLinesInFolder: () => void;
};

export default function LandingPage(props: LandingPageProps) {
  const { t } = useTranslations();

  return (
    <main>
      <h1>{t("app.title")}</h1>

      <UploadButton countLinesInFolder={props.countLinesInFolder} />
      <Show when={props.isLoading}>
        <CountingLines path={props.path as string} />
      </Show>
    </main>
  );
}
