import { Route, MemoryRouter, useSearchParams } from "@solidjs/router";
import { createStore } from "solid-js/store";
import "./styles/setup.css";
import type { Node } from "./utils/zon";

import HomePage from "./pages/HomePage/HomePage.tsx";
import ReportPage from "./pages/ReportPage/ReportPage.tsx";
import { I18nProvider } from "./utils/i18n.tsx";
import Routes from "./routes.ts";

function App() {
  const [reports, setReports] = createStore<Record<string, Node>>({});

  function setReport(path: string, root: Node) {
    setReports(path, root);
  }

  return (
    <I18nProvider>
      <MemoryRouter>
        <Route
          path={Routes.Home.Matcher}
          component={() => <HomePage reports={reports} setReport={setReport} />}
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
