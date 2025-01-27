import { A } from "@solidjs/router";
import Routes from "../../routes.ts";
import { type Node } from "../../utils/zon";
import { useI18n } from "../../utils/i18n.tsx";
import Sunburst from "./Sunburst/Sunburst.tsx";
import ReportList from "./ReportList/ReportList.tsx";
import Breadcrumbs from "./Breadcrumbs/Breadcrumbs.tsx";
import styles from "./ReportPage.module.css";
import { ReportStoreProvider } from "./ReportPage.state.tsx";
import ColorTest from "../HomePage/ColorTest.tsx";

type ReportPageProps = {
  root: Node;
};

export default function ReportPage(props: ReportPageProps) {
  const { t } = useI18n();

  return (
    <ReportStoreProvider reportRoot={props.root}>
      <ColorTest />
      <main class={`${styles["report-page"]} page`}>
        <div class="col-span-2">
          <h1 class="heading-l">
            <A
              class={styles["report-page__header-title"]}
              href={Routes.Home.Matcher}
            >
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
    </ReportStoreProvider>
  );
}
