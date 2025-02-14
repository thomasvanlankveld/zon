import { For, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import Routes from "../../routes";
import UploadButton from "../../components/UploadButton/UploadButton";
import CountingLines from "../../components/CountingLines";
import { useI18n } from "../../utils/i18n";
import logAsyncErrors from "../../utils/async/logErrors";
import { conicGradient, type Node } from "../../utils/zon";
import Logo from "../../components/Logo";
import NumberOfLines from "../../components/NumberOfLines";
import styles from "./HomePage.module.css";

type HomePageProps = {
  reports: Record<string, Node>;
  countLinesInFolder: () => Promise<string | null>;
  countingPath: string | null;
};

export default function HomePage(props: HomePageProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  async function countLinesInFolder() {
    const path = await props.countLinesInFolder();

    if (path != null) {
      navigate(Routes.Report.getLocation(path));
    }
  }

  return (
    <main
      style={{
        "--cloudy-background": conicGradient(),
        "--cloudy-opacity": "0.01",
        "min-height": "100dvh",
        display: "grid",
        "place-items": "center",
        padding: "var(--spacing-xxl)",
      }}
      class={`${styles["home-page"]} cloudy`}
    >
      <div
        style={{
          flex: "1 1 auto",
          height: "min(var(--container-s), 100%)",
          overflow: "auto",
          width: "min(var(--container-l), 100%)",
          background: "var(--color-background)",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "space-evenly",
          padding: "var(--spacing-xxl)",
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
          <Logo />
          {t("app.title")}
        </h1>

        <div>
          <For each={Object.entries(props.reports)}>
            {([path, root]) => (
              <div class={styles["home-page__report-row"]}>
                <A href={Routes.Report.getLocation(path)}>{path}</A>
                <NumberOfLines numberOfLines={root.numberOfLines} />
              </div>
            )}
          </For>
        </div>
        <div>
          <UploadButton
            countLinesInFolder={logAsyncErrors(countLinesInFolder)}
          />
          <Show when={props.countingPath}>
            {(definedPath) => <CountingLines path={definedPath()} />}
          </Show>
        </div>
      </div>
    </main>
  );
}
