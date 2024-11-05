import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import Donut from "./Donut";
import "./App.css";
import { Tokei } from "./utils/tokei";
import { Zon } from "./utils/zon";

// Test:
// /Users/thomasvanlankveld/Code/zon/src-tauri
// /Users/thomasvanlankveld/Code/everon-portal/frontend/src

function App() {
  const [root, setRoot] = createSignal<Zon.Node | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [path, setPath] = createSignal("");

  async function countLinesInFolder() {
    const projectPath = await open({
      multiple: false,
      directory: true,
    });

    if (projectPath == null) {
      throw new Error("No path found for opened folder");
    }

    setPath(projectPath);
    setLoading(true);

    const languages = await invoke("count_lines", { path: projectPath });
    const projectRoot = Zon.getHierarchy(
      projectPath,
      languages as Tokei.Languages,
      [Zon.CountType.blanks, Zon.CountType.code, Zon.CountType.comments]
    );

    setRoot(projectRoot);
    setLoading(false);
  }

  return (
    <main class="container">
      <h1>Welcome to Tauri + Solid</h1>

      <div class="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={logo} class="logo solid" alt="Solid logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and Solid logos to learn more.</p>

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
              Counted {rootVal.count} lines in {path()}:
            </p>
            <Donut root={rootVal} />
            <pre>{jsonReport}</pre>
          </div>
        );
      })()}
    </main>
  );
}

export default App;
