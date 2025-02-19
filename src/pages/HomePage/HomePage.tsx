import { For, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import Routes from "../../routes";
import { BackgroundConfig } from "../../components/Background/Background";
import UploadButton from "../../components/UploadButton/UploadButton";
import CountingLines from "../../components/CountingLines";
import { useI18n } from "../../utils/i18n";
import logAsyncErrors from "../../utils/async/logErrors";
import { type Node } from "../../utils/zon";
import Logo from "../../components/Logo";
import NumberOfLines from "../../components/NumberOfLines";
import styles from "./HomePage.module.css";

type HomePageProps = {
  reports: Record<string, Node>;
  countLinesInFolder: () => Promise<string | null>;
  countingPath: string | null;
  removeReport: (path: string) => void;
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
        "min-height": "100dvh",
        display: "grid",
        "place-items": "center",
        padding: "var(--spacing-xxl)",
      }}
    >
      <BackgroundConfig opacity={0.01} />
      <div
        style={{
          height: "min(var(--container-l), 100%)",
          width: "min(var(--container-3xl), 100%)",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "space-evenly",
        }}
        class="card glow"
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

        <div>
          <For each={Object.entries(props.reports)}>
            {([path, root]) => (
              <div class={styles["home-page__report-row"]}>
                <A href={Routes.Report.getLocation(path)}>{path}</A>
                <NumberOfLines numberOfLines={root.numberOfLines} />
                <button onClick={() => props.removeReport(path)}>Remove</button>
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
