import { createSignal, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";
import type { Languages } from "./utils/tokei.ts";
import { type Node, LINE_TYPE, createTree } from "./utils/zon";
import logAsyncErrors from "./utils/async/logErrors.ts";
import LandingPage from "./pages/LandingPage.tsx";
import ReportPage from "./pages/ReportPage/ReportPage.tsx";
import { I18nProvider } from "./utils/i18n.tsx";
import Canvas from "./pages/ReportPage/Canvas.tsx";

// Test:
// /Users/thomasvanlankveld/Code/zon/src-tauri
// /Users/thomasvanlankveld/Code/everon-portal/frontend/src

function App() {
  const [root, setRoot] = createSignal<Node | null>(null);
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

    setRoot(null);
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

    setRoot(projectRoot);
    setIsLoading(false);
  }

  return (
    <I18nProvider>
      <Show
        when={root()}
        keyed
        fallback={
          <LandingPage
            path={path()}
            isLoading={isLoading()}
            countLinesInFolder={logAsyncErrors(countLinesInFolder)}
          />
        }
      >
        {(rootVal) => (
          <ReportPage
            root={rootVal}
            countLinesInFolder={logAsyncErrors(countLinesInFolder)}
          />
        )}
      </Show>
    </I18nProvider>
  );
}

export default App;
