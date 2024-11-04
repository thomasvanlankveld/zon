import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

// Test:
// /Users/thomasvanlankveld/Code/zon/src-tauri
// /Users/thomasvanlankveld/Code/everon-portal/frontend/src

function App() {
  const [lineCounts, setLineCounts] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [path, setPath] = createSignal("");

  async function countLines() {
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

      <form
        class="row"
        onSubmit={(e) => {
          e.preventDefault();
          countLines();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setPath(e.currentTarget.value)}
          placeholder="Enter a path..."
        />
        <button type="submit">Count</button>
      </form>
      <p>{loading() && "Loading..."}</p>
      <pre>{lineCounts()}</pre>
    </main>
  );
}

export default App;
