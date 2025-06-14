# Release

## Semi-automated release

1. Bump version number and commit (and get it on the `master` branch)
   - `package.json`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`
     - Build the project to also update `src-tauri/Cargo.lock`
2. Tag the commit and push
   - `git tag vX.Y.Z`
   - `git push origin master --tags`
3. Find the release on GitHub and finish it
   - Add release notes
   - Mark the release as "latest"

## Manual release (not recommended)

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
   3. Rename the updater bundles (in `src-tauri/target/<architecture-os>/release/bundle/macos/zon.app.tar.gz`) to include the version and architecture name:
      - `zon_<version>_aarch64.app.tar.gz`
      - `zon_<version>_x86_64.app.tar.gz`
   4. Upload the updater bundles as assets to the GitHub release.
4. Create a [`latest.json` for updater](https://v2.tauri.app/plugin/updater/#static-json-file) and add it to the GitHub release assets
   - Set version
   - Set notes
   - Set pub date
   - Set **signatures and urls**!
5. Uncheck "pre-release" to mark the release as "latest"
