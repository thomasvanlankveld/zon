# Release

1. Bump version number, commit and push
   - `package.json`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`
     - Build the project to also update `src-tauri/Cargo.lock`
2. Create a release on GitHub, add release notes. Mark it as "pre-release"!
3. Create a [`latest.json` for updater](https://v2.tauri.app/plugin/updater/#static-json-file) and add it to the release assets
4. Make sure your environment has the [signing variables](https://v2.tauri.app/plugin/updater/#building). Build binaries, test them if needed, and upload them as release assets.
   - `deno task bundle-mac-silicon`
   - `deno task bundle-mac-intel`
5. Uncheck "pre-release" to mark the release as "latest"
