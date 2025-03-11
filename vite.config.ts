import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import legacy from "@vitejs/plugin-legacy";

// We target Safari 13 to support Apple hardware as far back as 2012/2013, as long as they updated
// their OS to 10.15 Catalina or later. Some relevant links:
// https://v1.tauri.app/v1/guides/faq/#recommended-browserlist
// https://developer.apple.com/documentation/safari-release-notes/safari-13-release-notes
// https://en.wikipedia.org/wiki/MacOS_Catalina#System_requirements

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [
    solid(),
    legacy({
      targets: ["safari >= 13"],
      modernPolyfills: true,
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },

  build: {
    // Disable minification to prevent Vite from crashing on the Terser plugin because it's trying to use `require()`
    minify: false,
    // Commented out `target` because these will be overridden by @vitejs/plugin-legacy
    // target: ["es2021", "safari13"],
  },
}));
