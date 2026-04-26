# Phased plan: automated “happy path” regression (local-first)

This repo is a Tauri v2 + Vite + SolidJS app, currently shipped on **macOS only**. Since **macOS does not provide a desktop WebDriver**, we cannot run “drive the real macOS desktop webview” E2E in CI.

Instead, we’ll cover the same user-visible happy path with three complementary layers. The **same commands** should work both locally and in CI.

- **Phase 1**: Rust backend integration tests for the `count_lines` command (best signal for Rust crate bumps).
- **Phase 2**: Browser-based Playwright E2E against the web UI (best signal for UI regressions).
- **Phase 3**: macOS build + launch smoke test (best signal for packaging/runtime breakages).

Each phase should land independently, and each should be runnable via simple local commands **and** in GitHub Actions.

## Local-first workflow (what “done” should feel like)

Aim for a small set of tasks so that “before pushing to `master`” is one command:

- `deno task test:rust` (Phase 1)
- `deno task test:web-e2e` (Phase 2)
- `deno task test:tauri-smoke` (Phase 3)
- `deno task test:all` (runs them in order)

These same tasks should be called from GitHub Actions unchanged.

## CI-on-PR workflow (recommended, especially for Dependabot)

Because Dependabot opens PRs automatically, it’s worth making the “happy path” checks run on **every PR** so you can merge with confidence (or immediately see breakage caused by dependency updates).

The CI jobs should simply run the same local tasks:

- `deno task test:rust`
- `deno task test:web-e2e`
- `deno task test:tauri-smoke`

## Target “happy path” (what we’re validating)

User flow to protect:

1. App loads and shows landing UI.
2. A “count lines” input is provided (desktop uses folder picker; web path uses pasted `tokei --output json`).
3. A report is produced and the report page renders key UI elements (e.g. total lines and list entries).

Back-end behavior to protect:

- The Rust `count_lines(path)` command successfully scans a real directory, returns non-empty `Languages`, and yields stable totals for a known fixture.

## Phase 0 (pre-work): choose stable fixtures + assertions

**Goal**: ensure tests are deterministic and don’t rely on developer machines.

- **Fixture folder**: add a small directory under `input/fixtures/fixture-project/` with a few files of known content (enough to exercise tokei across 2–3 languages).
- **Fixture JSON**: generate and commit a `tokei --output json` snapshot for the same fixture folder (or store a minimized JSON that matches the `Languages` type).
- **Stable assertions**:
  - Backend: total lines per language + overall total, or a snapshot of the `Languages` structure.
  - UI: presence of report page, presence of total lines label, at least one report list row.

Deliverables:

- `input/fixtures/fixture-project/**`
- `input/fixtures/tokei-fixture.json`
- A short note in this doc describing which UI nodes we assert on (prefer `data-testid`s).

## Phase 1: Rust integration tests for `count_lines`

**Goal**: catch regressions from Rust dependency bumps (e.g. tokei output changes, filesystem handling, serialization changes).

Implementation approach:

- Refactor `count_lines` so the core logic is testable as a normal Rust function (e.g. `fn count_lines_impl(path: &Path) -> Languages`).
- Keep the Tauri command as a thin wrapper around the function.
- Add integration tests under `src-tauri/tests/` (or unit tests in `src-tauri/src/lib.rs`) that:
  - run against the fixture directory in `input/fixtures/fixture-project/`
  - assert:
    - `Languages` is non-empty
    - totals match expectations (either explicit totals, or a snapshot)
    - optionally: the set of detected languages is as expected

Notes:

- Prefer *stable, intent-level* assertions (overall totals + key languages) rather than asserting exact ordering.
- If `Languages`’ serialized form changes between tokei versions, consider asserting on derived totals computed from the structure.

Deliverables:

- Rust tests in `src-tauri/` that run on macOS.
- A local task (recommended) that runs them via `deno task test:rust` (internally `cargo test` in `src-tauri/`).

Definition of done:

- `deno task test:rust` passes locally on macOS.

## Phase 2: Browser-based Playwright E2E for the report happy path

**Goal**: validate the UI still renders the happy path end-to-end (without needing Tauri WebDriver).

Why this works here:

- The app already has a “web” fallback flow (`LandingPageMainWeb`) that accepts pasted JSON and navigates to the report page.
- We can drive that in a normal browser using Playwright on macOS (locally), without involving Tauri.

Implementation approach:

- Add Playwright as a dev dependency.
- Add an E2E test that:
  - starts the Vite dev server or preview server
  - opens the landing page
  - pastes `input/fixtures/tokei-fixture.json` into the input
  - clicks the submit button
  - asserts the report page renders expected UI nodes
- Add a few `data-testid` attributes for test stability:
  - landing input
  - submit button
  - report page root
  - total lines label or report list root

Deliverables:

- `tests/e2e/happy-path.spec.ts`
- `playwright.config.*`
- A local task (recommended) like `deno task test:web-e2e` that:
  - boots the web app (dev/preview)
  - runs Playwright headless
- A one-time local setup task like `deno task playwright:install` (to install browsers) if needed.

Definition of done:

- `deno task test:web-e2e` passes locally and is reasonably non-flaky (explicit waits on test ids).

## Phase 3: macOS build + launch smoke test (Tauri bundle)

**Goal**: catch “it builds but won’t start” issues: packaging changes, missing resources, code signing config errors (where applicable), runtime panics at startup.

Implementation approach (local-first):

- Build the app in a PR-style configuration (no signing secrets required):
  - typically `tauri build` (debug or release depending on constraints)
- Add a small script that:
  - locates the built `.app`
  - launches it
  - waits briefly for it to stay running (or checks for immediate crash)
  - terminates it cleanly
- Keep the smoke test minimal: **start + no immediate crash** is the primary signal.

Deliverables:

- `scripts/ci/smoke-launch-macos.ts` (Deno) or a small shell script
- A local task (recommended) like `deno task test:tauri-smoke` that builds and runs the smoke check

Definition of done:

- `deno task test:tauri-smoke` passes locally (where feasible) and detects obvious startup crashes.

## Recommended rollout order

1. **Phase 1** (fastest + strongest signal for Rust dependency bumps)
2. **Phase 2** (guards UI regressions; independent of Tauri WebDriver)
3. **Phase 3** (guards packaging/runtime regressions; potentially the slowest)

## CI workflow shape (high level)

Create `.github/workflows/test.yml` (name TBD) that runs on:

- `pull_request`
- optionally `workflow_dispatch`

Jobs (macOS):

- `rust-test`: runs `deno task test:rust`
- `web-e2e`: runs `deno task test:web-e2e`
- `tauri-smoke`: runs `deno task test:tauri-smoke`

Future: If/when the app ships on Windows/Linux, add:

- Real Tauri WebDriver E2E (tauri-driver) on Linux/Windows, and keep macOS on the three-layer strategy above.

