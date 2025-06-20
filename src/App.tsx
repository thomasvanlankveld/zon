import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { createSignal, Show } from "solid-js";
import { Route, MemoryRouter, useSearchParams } from "@solidjs/router";
import { createStore } from "solid-js/store";

import "./styles/setup.css";
import MaybeUpdater from "./components/Updater/MaybeUpdater.tsx";
import AppProviders from "./contexts/app.tsx";
import { LINE_TYPE, type Node, createTree } from "./utils/zon";
import HomePage from "./pages/HomePage/HomePage.tsx";
import LandingPage from "./pages/LandingPage/LandingPage.tsx";
import ReportPage from "./pages/ReportPage/ReportPage.tsx";
import { Languages } from "./utils/tokei.ts";
import Routes from "./routes.ts";

// Development mode check - true in development, false in production
const isHomePageEnabled = import.meta.env.MODE === "development";

/**
 * The main zon app component.
 *
 * @returns The app
 */
export default function App() {
  // TODO: Move some of this stuff into a context
  const [reports, setReports] = createStore<Record<string, Node>>({});

  function setReport(path: string, root: Node) {
    setReports(path, root);
  }

  function removeReport(path: string) {
    setReports(path, undefined!);
  }

  const [countingPath, setCountingPath] = createSignal<string | null>(null);

  async function countLinesInFolder() {
    const path = await open({
      multiple: false,
      directory: true,
    });

    if (path == null) {
      return null;
    }

    setCountingPath(path);

    const languages = await invoke("count_lines", { path: path });
    const reportRoot = createTree(path, languages as Languages, [
      LINE_TYPE.BLANKS,
      LINE_TYPE.CODE,
      LINE_TYPE.COMMENTS,
    ]);

    setReport(path, reportRoot);
    setCountingPath(null);

    return path;
  }

  return (
    <AppProviders>
      <MemoryRouter>
        <Route
          path={Routes.Home.Matcher}
          component={() => (
            <Show
              when={Object.values(reports).length > 0 && isHomePageEnabled}
              fallback={
                <LandingPage
                  countLinesInFolder={countLinesInFolder}
                  countingPath={countingPath()}
                  setReport={setReport}
                />
              }
            >
              <HomePage
                reports={reports}
                countLinesInFolder={countLinesInFolder}
                countingPath={countingPath()}
                removeReport={removeReport}
              />
            </Show>
          )}
        />
        <Route
          path={Routes.Report.Matcher}
          component={() => {
            const [searchParams] = useSearchParams();
            const rootPath = searchParams.rootPath;

            if (typeof rootPath !== "string") {
              throw new Error(
                `Can't display report for root path ${rootPath?.toString()}`,
              );
            }

            const reportRoot = reports[rootPath];

            return <ReportPage root={reportRoot} />;
          }}
        />
        <MaybeUpdater />
      </MemoryRouter>
    </AppProviders>
  );
}
