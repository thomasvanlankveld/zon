import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Routes from "../../routes";
import { BackgroundConfig } from "../../components/Background/Background";
import { useI18n } from "../../contexts/i18n";
import logAsyncErrors from "../../utils/async/logErrors";
import Logo from "../../components/Logo";
import { TARGET, useTarget } from "../../contexts/target";
import { type Node } from "../../utils/zon";
import LandingPageMainDesktop from "./LandingPageMainDesktop";
import LandingPageMainWeb from "./LandingPageMainWeb";
import styles from "./LandingPage.module.css";

type LandingPageProps = {
  countLinesInFolder: () => Promise<string | null>;
  countingPath: string | null;
  setReport: (path: string, root: Node) => void;
};

export default function LandingPage(props: LandingPageProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const target = useTarget();

  async function countLinesInFolder() {
    const path = await props.countLinesInFolder();

    if (path != null) {
      navigate(Routes.Report.getLocation(path));
    }
  }

  function setReport(path: string, root: Node) {
    props.setReport(path, root);

    navigate(Routes.Report.getLocation(path));
  }

  return (
    <div class="page" data-page-items="center">
      <BackgroundConfig opacity={0.01} />
      <div
        style={{
          "--glimmer-border-radius": "var(--spacing-card-border-radius)",
        }}
        class={`${styles["landing-page__card"]} ${styles["landing-page__wrapper"]} card glow`}
      >
        <header class="app-heading heading-xxl">
          <Logo size={70} />
          <h1>{t("app.title")}</h1>
        </header>

        <main class={styles["landing-page__wrapper"]}>
          <Show
            when={target === TARGET.DESKTOP}
            fallback={<LandingPageMainWeb setReport={setReport} />}
          >
            <LandingPageMainDesktop
              countLinesInFolder={logAsyncErrors(countLinesInFolder)}
              countingPath={props.countingPath}
            />
          </Show>
        </main>
      </div>
    </div>
  );
}
