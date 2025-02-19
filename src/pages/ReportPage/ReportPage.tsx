import { A } from "@solidjs/router";
import Routes from "../../routes.ts";
import { BackgroundConfig } from "../../components/Background/Background.tsx";
import { type Node } from "../../utils/zon";
import { useI18n } from "../../utils/i18n.tsx";
import Sunburst from "./Sunburst/Sunburst.tsx";
import ReportList from "./ReportList/ReportList.tsx";
import Breadcrumbs from "./Breadcrumbs/Breadcrumbs.tsx";
import styles from "./ReportPage.module.css";
import { ReportStoreProvider, useReportState } from "./ReportPage.state.tsx";
import Logo from "../../components/Logo.tsx";

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

  return (
    <main class={`${styles["report-page"]} page`} data-page-items="stretch">
      <BackgroundConfig
        opacity={0.2}
        startPosition={diagramRoot().firstLine / reportRoot().numberOfLines}
        span={diagramRoot().numberOfLines / reportRoot().numberOfLines}
      />
      <div style={{ display: "flex" }} class="col-span-2">
        <h1 style={{ display: "flex" }} class="heading-regular">
          <A
            class={`${styles["report-page__header-title"]} app-heading block`}
            href={Routes.Home.Matcher}
          >
            {/* TODO: screen-reader only text "back to overview"? */}
            <Logo size={32} />
            {t("app.title")}
          </A>
        </h1>
      </div>
      <Breadcrumbs class={styles["report-page__breadcrumbs"]} />
      <Sunburst />
      <ReportList class={styles["report-page__report-list"]} />
      {/* For debugging: */}
      {/* <pre>{JSON.stringify(props.root, null, 2)}</pre> */}
    </main>
  );
}
