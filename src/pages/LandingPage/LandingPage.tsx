import { createSignal, For, type Setter, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import UploadButton from "../../components/UploadButton/UploadButton";
import CountingLines from "../../components/CountingLines";
import { useI18n } from "../../utils/i18n";
import { rainbow } from "../../utils/zon/color";
import logAsyncErrors from "../../utils/async/logErrors";
import { createTree, LINE_TYPE, type Node } from "../../utils/zon";
import type { Languages } from "../../utils/tokei";
import ROUTES from "../../routes";

type LandingPageProps = {
  setRoot: Setter<Node | null>;
};

function ColorSpread(props: { getColor: (val: number) => string }) {
  const colors = () =>
    Array.from({ length: 1001 })
      .fill(null)
      .map((_, index) => props.getColor(Number((0.001 * index).toFixed(3))));

  return (
    <svg width="1000" height="100">
      <For each={colors()}>
        {(color, index) => (
          <rect x={index()} y={0} width={1} height={100} fill={color} />
        )}
      </For>
    </svg>
  );
}

function ColorTest() {
  return (
    <div style={{ display: "grid", padding: "6rem" }}>
      <ColorSpread getColor={(val) => rainbow(val).default} />
      <ColorSpread getColor={(val) => rainbow(val).highlight} />
      <ColorSpread getColor={(val) => rainbow(val).press} />
    </div>
  );
}

export default function LandingPage(props: LandingPageProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [isLoading, setIsLoading] = createSignal(false);
  const [path, setPath] = createSignal("");

  async function countLinesInFolder() {
    const projectPath = await open({
      multiple: false,
      directory: true,
    });

    if (projectPath == null) {
      return;
    }

    props.setRoot(null);
    setPath(projectPath);
    setIsLoading(true);

    // Maybe adopt createResource for this?
    // https://www.solidjs.com/tutorial/async_resources
    // https://docs.solidjs.com/reference/basic-reactivity/create-resource
    // https://www.solidjs.com/tutorial/async_suspense (Using `<Show>` is also fine for client-only projects)
    // https://www.solidjs.com/tutorial/async_transitions
    // https://docs.solidjs.com/reference/reactive-utilities/use-transition
    const languages = await invoke("count_lines", { path: projectPath });
    const projectRoot = createTree(projectPath, languages as Languages, [
      LINE_TYPE.BLANKS,
      LINE_TYPE.CODE,
      LINE_TYPE.COMMENTS,
    ]);

    props.setRoot(projectRoot);
    setIsLoading(false);
    navigate(ROUTES.REPORT);
  }

  return (
    <main>
      <h1>{t("app.title")}</h1>

      <ColorTest />
      <UploadButton countLinesInFolder={logAsyncErrors(countLinesInFolder)} />
      <Show when={isLoading()}>
        <CountingLines path={path()} />
      </Show>
    </main>
  );
}
