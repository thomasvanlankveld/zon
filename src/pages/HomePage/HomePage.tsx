import { createSignal, type Setter, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import ROUTES from "../../routes";
import UploadButton from "../../components/UploadButton/UploadButton";
import CountingLines from "../../components/CountingLines";
import { useI18n } from "../../utils/i18n";
import logAsyncErrors from "../../utils/async/logErrors";
import { createTree, LINE_TYPE, type Node } from "../../utils/zon";
import type { Languages } from "../../utils/tokei";
// import ColorTest from "./ColorTest";

type LandingPageProps = {
  setRoot: Setter<Node | null>;
};

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

      {/* <ColorTest /> */}
      <UploadButton countLinesInFolder={logAsyncErrors(countLinesInFolder)} />
      <Show when={isLoading()}>
        <CountingLines path={path()} />
      </Show>
    </main>
  );
}
