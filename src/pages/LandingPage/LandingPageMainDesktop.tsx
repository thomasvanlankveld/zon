import { Show } from "solid-js";
import CountingLines from "../../components/CountingLines";
import UploadButton from "../../components/UploadButton/UploadButton";
import { useI18n } from "../../contexts/i18n";
import styles from "./LandingPage.module.css";

type LandingPageMainDesktopProps = {
  countLinesInFolder: () => void;
  countingPath: string | null;
};

export default function LandingPageMainDesktop(
  props: LandingPageMainDesktopProps,
) {
  const { t } = useI18n();

  return (
    <>
      <span class={styles["landing-page__welcome-text"]}>
        <Show
          when={props.countingPath}
          fallback={t("landing-page.welcome-message")}
        >
          {(definedPath) => <CountingLines path={definedPath()} />}
        </Show>
      </span>

      <div>
        <UploadButton countLinesInFolder={props.countLinesInFolder} />
      </div>
    </>
  );
}
