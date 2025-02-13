import { A } from "@solidjs/router";
import Routes from "../../routes.ts";
import { rainbow, type Node } from "../../utils/zon";
import { useI18n } from "../../utils/i18n.tsx";
import Sunburst from "./Sunburst/Sunburst.tsx";
import ReportList from "./ReportList/ReportList.tsx";
import Breadcrumbs from "./Breadcrumbs/Breadcrumbs.tsx";
import styles from "./ReportPage.module.css";
import { ReportStoreProvider, useReportState } from "./ReportPage.state.tsx";

type ReportPageProps = {
  root: Node;
};

export default function ReportPage(props: ReportPageProps) {
  return (
    <ReportStoreProvider reportRoot={props.root}>
      <ReportPageContent />
    </ReportStoreProvider>
  );
}

function ReportPageContent() {
  const { t } = useI18n();

  const { reportRoot, diagramRoot } = useReportState();

  const numberOfColors = 16;
  const step = () =>
    diagramRoot().numberOfLines / reportRoot().numberOfLines / numberOfColors;

  function getPosition(i: number) {
    return diagramRoot().firstLine / reportRoot().numberOfLines + i * step();
  }

  const colors = () =>
    // Add one so that the first color is the same as the last
    Array.from({ length: numberOfColors + 1 })
      .fill(null)
      .map((_, i) => rainbow(getPosition(i)).regular);
  const conicGradient = () => `conic-gradient(${colors().join(", ")})`;

  return (
    <main
      style={{
        "--glow-background": conicGradient(),
        "--glow-opacity": "0.015",
      }}
      class={`${styles["report-page"]} page glow`}
    >
      <div style={{ display: "flex" }} class="col-span-2">
        <h1 style={{ display: "flex" }} class="heading-regular">
          <A
            style={{
              background: "var(--color-background)",
              "padding-block": "var(--spacing-m)",
              "padding-inline": "var(--spacing-l)",
            }}
            class={styles["report-page__header-title"]}
            href={Routes.Home.Matcher}
          >
            {/* Back */}
            {t("app.title")}
          </A>
        </h1>
      </div>
      <Breadcrumbs class={styles["report-page__breadcrumbs"]} />
      <Sunburst />
      <ReportList />
      {/* For debugging: */}
      {/* <pre>{JSON.stringify(props.root, null, 2)}</pre> */}
    </main>
  );
}
