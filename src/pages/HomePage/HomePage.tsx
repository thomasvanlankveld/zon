import { createSignal, For, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import Routes from "../../routes";
import UploadButton from "../../components/UploadButton/UploadButton";
import CountingLines from "../../components/CountingLines";
import { useI18n } from "../../utils/i18n";
import logAsyncErrors from "../../utils/async/logErrors";
import { createTree, LINE_TYPE, type Node } from "../../utils/zon";
import type { Languages } from "../../utils/tokei";
import NumberOfLines from "../../components/NumberOfLines";

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

    // Maybe adopt createResource for this?
    // https://www.solidjs.com/tutorial/async_resources
    // https://docs.solidjs.com/reference/basic-reactivity/create-resource
    // https://www.solidjs.com/tutorial/async_suspense (Using `<Show>` is also fine for client-only projects)
    // https://www.solidjs.com/tutorial/async_transitions
    // https://docs.solidjs.com/reference/reactive-utilities/use-transition
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

  return (
    <main>
      <h1>{t("app.title")}</h1>

      <div>
        <For each={Object.entries(props.reports)}>
          {([path, root]) => (
            <div>
              <A href={Routes.Report.getLocation(path)}>{path}</A>
              <NumberOfLines numberOfLines={root.numberOfLines} />
            </div>
          )}
        </For>
      </div>
      {/* <ColorTest /> */}
      <UploadButton countLinesInFolder={logAsyncErrors(countLinesInFolder)} />
      <Show when={countingPath()}>
        {(definedPath) => <CountingLines path={definedPath()} />}
      </Show>
    </main>
  );
}
