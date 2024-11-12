import { createSignal, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";
import type { Languages } from "./utils/tokei.ts";
import { type Node, LineType, createTree } from "./utils/zon.ts";
import logAsyncErrors from "./utils/async/logErrors.ts";
import LandingPage from "./pages/LandingPage.tsx";
import ReportPage from "./pages/ReportPage.tsx";

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
      throw new Error("No path found for opened folder");
    }

    setRoot(null);
    setPath(projectPath);
    setIsLoading(true);

    const languages = await invoke("count_lines", { path: projectPath });
    const projectRoot = createTree(projectPath, languages as Languages, [
      LineType.blanks,
      LineType.code,
      LineType.comments,
    ]);

    setRoot(projectRoot);
    setIsLoading(false);
  }

  return (
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
      {(rootVal) => <ReportPage root={rootVal} path={path()} />}
    </Show>
  );
}

export default App;
