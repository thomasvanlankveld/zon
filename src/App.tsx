import { Show } from "solid-js";
import { Route, MemoryRouter, useSearchParams } from "@solidjs/router";

import "./styles/setup.css";
import MaybeUpdater from "./components/Updater/MaybeUpdater.tsx";
import AppProviders from "./contexts/app.tsx";
import { useReportsContext } from "./contexts/reports.tsx";
import HomePage from "./pages/HomePage/HomePage.tsx";
import LandingPage from "./pages/LandingPage/LandingPage.tsx";
import ReportPage from "./pages/ReportPage/ReportPage.tsx";
import Routes from "./routes.ts";

// Development mode check - true in development, false in production
const isHomePageEnabled = import.meta.env.MODE === "development";

function HomeRoute() {
  const { reports, countLinesInFolder, countingPath, setReport, removeReport } =
    useReportsContext();

  return (
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
  );
}

function ReportRoute() {
  const [searchParams] = useSearchParams();
  const { reports } = useReportsContext();
  const rootPath = searchParams.rootPath;

  if (typeof rootPath !== "string") {
    throw new Error(
      `Can't display report for root path ${rootPath?.toString()}`,
    );
  }

  const reportRoot = reports[rootPath];

  return <ReportPage root={reportRoot} />;
}

/**
 * The main zon app component.
 *
 * @returns The app
 */
export default function App() {
  return (
    <AppProviders>
      <MemoryRouter>
        <Route path={Routes.Home.Matcher} component={HomeRoute} />
        <Route path={Routes.Report.Matcher} component={ReportRoute} />
        <MaybeUpdater />
      </MemoryRouter>
    </AppProviders>
  );
}
