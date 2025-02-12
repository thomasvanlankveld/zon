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

  // oklch(0.82 0.307 287.621)
  // oklch(0.82 0.303 311.851)
  // oklch(0.82 0.297 336.653)
  // oklch(0.82 0.287 0)
  // oklch(0.82 0.277 14.4)

  // oklch(0.82 0.267 28.8)
  // oklch(0.82 0.26 43.2)
  // oklch(0.82 0.257 57.6)
  // oklch(0.82 0.26 72)
  // oklch(0.82 0.267 86.4)

  // oklch(0.82 0.277 101.059)
  // oklch(0.82 0.287 118.186)
  // oklch(0.82 0.289 134.126)
  // oklch(0.82 0.276 143.4)
  // oklch(0.82 0.265 152.213)

  // oklch(0.82 0.264 173.496)
  // oklch(0.82 0.273 206.098)
  // oklch(0.82 0.287 237.686)
  // oklch(0.82 0.299 258)
  // oklch(0.82 0.306 269.866)

  // box-shadow:
  //   inset 0 0 50px #fff,
  //   inset 20px 0 80px #f0f,
  //   inset -20px 0 80px #0ff,
  //   inset 20px 0 300px #f0f,
  //   inset -20px 0 300px #0ff;

  const numberOfColors = 32;
  const step = 1 / numberOfColors;

  function getPosition(i: number) {
    return i * step;
  }

  // // Box shadow doesn't let us isolate sides
  // const boxShadow = () =>
  //   Array.from({ length: numberOfColors })
  //     .fill(null)
  //     .map((_, i) => {
  //       const position = getPosition(i);
  //       const color = rainbow(position).regular;
  //       const offsetX = 6 * Math.sin(position * 2 * Math.PI);
  //       const offsetY = 6 * Math.cos(position * 2 * Math.PI);
  //       return `inset ${offsetX}rem ${offsetY}rem 3rem ${color}`;
  //     })
  //     .join(",");

  // // Radial gradients are not distributed very well
  // const radialGradients = () =>
  //   Array.from({ length: numberOfColors })
  //     .fill(null)
  //     .map((_, i) => {
  //       const position = getPosition(i);
  //       const color = rainbow(position).regular;
  //       const horizontal = 50 + 50 * Math.sin(position * 2 * Math.PI);
  //       const vertical = 50 - 50 * Math.cos(position * 2 * Math.PI);
  //       // return `radial-gradient(circle at ${horizontal}% ${vertical}%, ${color}, transparent 40%)`;
  //       return `radial-gradient(circle at ${horizontal}% ${vertical}%, ${color}, transparent 50%)`;
  //     })
  //     .join(",");

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
        // position: "relative",
        // background: conicGradient(),
        "--conic-gradient": conicGradient(),
        // "box-shadow": `inset 0 0 6rem white`,
        // "box-shadow": `inset 0 0 6rem ${conicGradient()}`,
      }}
      class={`${styles["home-page"]} page glowing`}
    >
      {/* <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          // background: "black",
          "z-index": -1,
          // background: radialGradients(),
          // background: `
          // radial-gradient(
          //   circle at 50% -50%,
          //   oklch(0.82 0.307 287.621),
          //   transparent 50%
          // ),
          // radial-gradient(
          //   circle at -50% 50%,
          //   oklch(0.82 0.267 28.8),
          //   transparent 50%
          // )
          // `,
          // margin: "-200rem",
          // "box-shadow": boxShadow(),
          // "box-shadow": `
          //   inset 0 3rem 6rem oklch(0.82 0.307 287.621),
          //   inset -3rem 0 6rem oklch(0.82 0.267 28.8),
          //   inset 0 -3rem 6rem oklch(0.82 0.277 101.059),
          //   inset 3rem 0 6rem oklch(0.82 0.264 173.496)
          // `,
        }}
      /> */}
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
      {/* <ColorTest /> */}
      <div>
        <UploadButton countLinesInFolder={logAsyncErrors(countLinesInFolder)} />
        <Show when={countingPath()}>
          {(definedPath) => <CountingLines path={definedPath()} />}
        </Show>
      </div>
    </main>
  );
}
