import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Routes from "../../routes";
import { BackgroundConfig } from "../../components/Background/Background";
import UploadButton from "../../components/UploadButton/UploadButton";
import CountingLines from "../../components/CountingLines";
import { useI18n } from "../../contexts/i18n";
import logAsyncErrors from "../../utils/async/logErrors";
import Logo from "../../components/Logo";
import styles from "./LandingPage.module.css";

type LandingPageProps = {
  countLinesInFolder: () => Promise<string | null>;
  countingPath: string | null;
};

export default function LandingPage(props: LandingPageProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  async function countLinesInFolder() {
    const path = await props.countLinesInFolder();

    if (path != null) {
      navigate(Routes.Report.getLocation(path));
    }
  }

  return (
    <div class="page" data-page-items="center">
      <BackgroundConfig opacity={0.01} />
      <div
        style={{
          "--glimmer-border-radius": "var(--spacing-card-border-radius)",
        }}
        class={`${styles["landing-page__card"]} ${styles["landing-page__wrapper"]} card glimmer glow`}
      >
        <header class="app-heading heading-xxl">
          <Logo size={70} />
          <h1>{t("app.title")}</h1>
        </header>

        <main class={styles["landing-page__wrapper"]}>
          <span class={styles["landing-page__welcome-text"]}>
            <Show
              when={props.countingPath}
              fallback={t("landing-page.welcome-message")}
            >
              {(definedPath) => <CountingLines path={definedPath()} />}
            </Show>
          </span>

          <div>
            <UploadButton
              countLinesInFolder={logAsyncErrors(countLinesInFolder)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
