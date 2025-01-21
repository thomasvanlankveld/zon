import { type Node } from "../../utils/zon";
import { useI18n } from "../../utils/i18n.tsx";
import Sunburst from "./Sunburst/Sunburst.tsx";
import ReportList from "./ReportList/ReportList.tsx";
import Breadcrumbs from "./Breadcrumbs/Breadcrumbs.tsx";
import styles from "./ReportPage.module.css";
import { ReportStoreProvider } from "./ReportPage.state.tsx";

type ReportPageProps = {
  root: Node;
};

export default function ReportPage(props: ReportPageProps) {
  const { t } = useI18n();

  return (
    <ReportStoreProvider reportRoot={props.root}>
      <main class={styles["report-page"]}>
        <div class={styles["report-page__header"]}>
          <h1 class="heading-l">{t("app.title")}</h1>
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
