import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { createSignal } from "solid-js";
import { Route, MemoryRouter, useSearchParams } from "@solidjs/router";
import { createStore } from "solid-js/store";

import "./styles/setup.css";
import { createTree, LINE_TYPE, type Node } from "./utils/zon";
import HomePage from "./pages/HomePage/HomePage.tsx";
import ReportPage from "./pages/ReportPage/ReportPage.tsx";
import { Languages } from "./utils/tokei.ts";
import { I18nProvider } from "./utils/i18n.tsx";
import Routes from "./routes.ts";

function App() {
  // TODO: Move some of this stuff into a context
  const [reports, setReports] = createStore<Record<string, Node>>({});

  function setReport(path: string, root: Node) {
    setReports(path, root);
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
    <I18nProvider>
      <MemoryRouter>
        <Route
          path={Routes.Home.Matcher}
          component={() => (
            <HomePage
              reports={reports}
              countLinesInFolder={countLinesInFolder}
              countingPath={countingPath()}
            />
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
      </MemoryRouter>
    </I18nProvider>
  );
}

export default App;
