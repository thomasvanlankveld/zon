import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Routes from "../../routes";
import { BackgroundConfig } from "../../components/Background/Background";
import UploadButton from "../../components/UploadButton/UploadButton";
import CountingLines from "../../components/CountingLines";
import { useI18n } from "../../utils/i18n";
import logAsyncErrors from "../../utils/async/logErrors";
import Logo from "../../components/Logo";

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
    <main class="page" data-page-items="center">
      <BackgroundConfig opacity={0.01} />
      <div
        style={{
          // TODO: introduce a css prop for card border-radius and use that instead
          "--glimmer-border-radius": "var(--spacing-xl)",
          height: "min(var(--container-s), 100%)",
          width: "min(var(--container-l), 100%)",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "space-evenly",
        }}
        class="card glimmer glow"
      >
        <h1
          class="heading-xxl"
          style={{
            display: "flex",
            gap: "var(--spacing-xl)",
            "align-items": "center",
          }}
        >
          <Logo size={70} />
          {t("app.title")}
        </h1>

        <div
          style={{
            display: "grid",
            "place-items": "center",
            gap: "var(--spacing-xl)",
            "text-align": "center",
            "text-wrap": "balance",
          }}
        >
          <span
            style={{ "min-height": "calc(2 * var(--line-height-regular))" }}
          >
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
        </div>
      </div>
    </main>
  );
}
