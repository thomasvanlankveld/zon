import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import Donut from "./Donut";
import "./App.css";

// Test:
// /Users/thomasvanlankveld/Code/zon/src-tauri
// /Users/thomasvanlankveld/Code/everon-portal/frontend/src

function App() {
  const [lineCounts, setLineCounts] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [path, setPath] = createSignal("");

  async function countLinesInFolder() {
    const file = await open({
      multiple: false,
      directory: true,
    });

    if (file == null) {
      throw new Error("No path found for file");
    }

    setPath(file);

    setLoading(true);
    const languages = await invoke("count_lines", { path: path() });
    setLineCounts(JSON.stringify(languages, null, 2));
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
      {lineCounts() && (
        <div>
          <p>Counted lines in {path()}:</p>
          <pre>{lineCounts()}</pre>
        </div>
      )}
      {Donut()}
    </main>
  );
}

export default App;
