import { createSignal, For, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import Routes from "../../routes";
import UploadButton from "../../components/UploadButton/UploadButton";
import CountingLines from "../../components/CountingLines";
import { useI18n } from "../../utils/i18n";
import logAsyncErrors from "../../utils/async/logErrors";
import { createTree, LINE_TYPE, rainbow, type Node } from "../../utils/zon";
import type { Languages } from "../../utils/tokei";
import Logo from "../../components/Logo";
import NumberOfLines from "../../components/NumberOfLines";
import styles from "./HomePage.module.css";

type LandingPageProps = {
  reports: Record<string, Node>;
  setReport: (path: string, root: Node) => void;
};

export default function LandingPage(props: LandingPageProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [countingPath, setCountingPath] = createSignal<string | null>();

  async function countLinesInFolder() {
    const path = await open({
      multiple: false,
      directory: true,
    });

    if (path == null) {
      return;
    }

    setCountingPath(path);

    const languages = await invoke("count_lines", { path: path });
    const reportRoot = createTree(path, languages as Languages, [
      LINE_TYPE.BLANKS,
      LINE_TYPE.CODE,
      LINE_TYPE.COMMENTS,
    ]);

    props.setReport(path, reportRoot);
    setCountingPath(null);
    navigate(Routes.Report.getLocation(path));
  }

  const numberOfColors = 16;
  const step = 1 / numberOfColors;

  function getPosition(i: number) {
    return i * step;
  }

  // Conic gradient places colors accurately
  const colors = () =>
    // Add one so that the first color is the same as the last
    Array.from({ length: numberOfColors + 1 })
      .fill(null)
      .map((_, i) => rainbow(getPosition(i)).regular);
  const conicGradient = () => `conic-gradient(${colors().join(", ")})`;

  return (
    <main
      style={{
        "--glow-background": conicGradient(),
        "--glow-opacity": "0.01",
        "min-height": "100dvh",
        display: "grid",
        "place-items": "center",
        padding: "var(--spacing-xxl)",
      }}
      class={`${styles["home-page"]} glow`}
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
          <Show when={countingPath()}>
            {(definedPath) => <CountingLines path={definedPath()} />}
          </Show>
        </div>
      </div>
    </main>
  );
}
