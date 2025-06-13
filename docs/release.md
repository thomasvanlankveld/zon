# Release

1. Bump version number, commit and push
   - `package.json`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`
     - Build the project to also update `src-tauri/Cargo.lock`
2. Create a release on GitHub, add release notes. Mark it as "pre-release"!
3. Build, bundle and upload the app:
   1. Make sure your environment has the [signing variables](https://v2.tauri.app/plugin/updater/#building), and build the binaries:
      - `deno task bundle-mac-silicon`
      - `deno task bundle-mac-intel`
   2. Test the binaries if needed
   3. Rename the updater bundles (in `target/<architecture-os>/release/bundle/macos/zon.app.tar.gz`) to include the architecture name:
      - `zon-aarch64.app.tar.gz`
      - `zon-x86_64.app.tar.gz`
   4. Upload the updater bundles as assets to the GitHub release.
4. Create a [`latest.json` for updater](https://v2.tauri.app/plugin/updater/#static-json-file) and add it to the GitHub release assets
5. Uncheck "pre-release" to mark the release as "latest"
