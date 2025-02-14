import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Routes from "../../routes";
import UploadButton from "../../components/UploadButton/UploadButton";
import CountingLines from "../../components/CountingLines";
import { useI18n } from "../../utils/i18n";
import logAsyncErrors from "../../utils/async/logErrors";
import { conicGradient } from "../../utils/zon";
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

  const gradient = conicGradient();

  return (
    <main
      style={{
        "min-height": "100dvh",
        display: "grid",
        "place-items": "center",
        padding: "var(--spacing-xxl)",
        "--cloudy-background": gradient,
        // "--cloudy-opacity": "0.3",
      }}
      class="cloudy"
    >
      <div
        style={{
          flex: "1 1 auto",
          height: "min(var(--container-s), 100%)",
          width: "min(var(--container-l), 100%)",
          "--glow-background": gradient,
        }}
        class="glow"
      >
        <div
          style={{
            height: "min(var(--container-s), 100%)",
            overflow: "auto",
            background: "var(--color-background)",
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
            "justify-content": "space-evenly",
            "padding-block": "var(--spacing-xxl)",
            "padding-inline": "var(--spacing-4xl)",
          }}
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
      </div>
    </main>
  );
}
