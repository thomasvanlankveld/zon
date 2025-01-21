import { createSignal } from "solid-js";
import { Route, MemoryRouter } from "@solidjs/router";
import "./styles/setup.css";
import type { Node } from "./utils/zon";

import LandingPage from "./pages/LandingPage/LandingPage.tsx";
import ReportPage from "./pages/ReportPage/ReportPage.tsx";
import { I18nProvider } from "./utils/i18n.tsx";
import ROUTES from "./routes.ts";

function App() {
  const [root, setRoot] = createSignal<Node | null>(null);

  return (
    <I18nProvider>
      <MemoryRouter>
        <Route
          path={ROUTES.HOME}
          component={() => <LandingPage setRoot={setRoot} />}
        />
        <Route
          path={ROUTES.REPORT}
          component={() => {
            const rootVal = root();

            if (rootVal == null) {
              throw new Error("Can't render report page, root is not defined");
            }

            return <ReportPage root={rootVal} />;
          }}
        />
      </MemoryRouter>
    </I18nProvider>
  );
}

export default App;
