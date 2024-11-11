import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import Donut from "./Donut.tsx";
import "./App.css";
import { Languages } from "./utils/tokei.ts";
import { Node, LineType, createTree } from "./utils/zon.ts";

// Test:
// /Users/thomasvanlankveld/Code/zon/src-tauri
// /Users/thomasvanlankveld/Code/everon-portal/frontend/src

function App() {
  const [root, setRoot] = createSignal<Node | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [path, setPath] = createSignal("");
  // Path of the file for the hovered arc
  const [hoveredArcFilePath, setHoveredArcFilePath] = createSignal<
    string | null
  >(null);

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
    setLoading(true);

    const languages = await invoke("count_lines", { path: projectPath });
    const projectRoot = createTree(projectPath, languages as Languages, [
      LineType.blanks,
      LineType.code,
      LineType.comments,
    ]);

    setRoot(projectRoot);
    setLoading(false);
  }

  return (
    <main class="container">
      <h1>Zon</h1>

      <button onClick={countLinesInFolder}>Select folder</button>
      {loading() && <p>Counting lines in {path()}</p>}
      {(() => {
        const rootVal = root();
        const jsonReport = JSON.stringify(rootVal, null, 2);

        if (!rootVal) {
          return;
        }

        return (
          <div>
            <p>
              Counted {rootVal.numberOfLines} lines in {path()}:
            </p>
            {/* TODO: Add line count? Maybe keep hashmap of all root descendants for fast lookup? */}
            <p>Hovering: {hoveredArcFilePath() ?? "..."}</p>
            <Donut
              root={rootVal}
              setHoveredArcFilePath={setHoveredArcFilePath}
            />
            <pre>{jsonReport}</pre>
          </div>
        );
      })()}
    </main>
  );
}

export default App;
