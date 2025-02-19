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
          "--glimmer-border-radius": "var(--spacing-card-border-radius)",
          height: "min(var(--container-s), 100%)",
          width: "min(var(--container-l), 100%)",
          // Padding increase balance layout despite the span's `min-height`
          "padding-block":
            "calc(var(--spacing-card-padding) + var(--line-height-regular))",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "space-evenly",
          gap: "var(--spacing-xl)",
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

        <span
          style={{
            // Min height to prevent most layout jumps when the text changes to "counting lines in <long-path>"
            "min-height": "calc(3 * var(--line-height-regular))",
            display: "flex",
            "align-items": "center",
            "text-align": "center",
            "text-wrap": "balance",
          }}
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
    </main>
  );
}
