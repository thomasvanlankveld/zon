import { A } from "@solidjs/router";
import Routes from "../../routes.ts";
import { rainbow, type Node } from "../../utils/zon";
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

  const numberOfColors = 32;
  const step = 1 / numberOfColors;

  function getPosition(i: number) {
    return i * step;
  }

  const colors = () =>
    // Add one so that the first color is the same as the last
    Array.from({ length: numberOfColors + 1 })
      .fill(null)
      .map((_, i) => rainbow(getPosition(i)).regular);
  const conicGradient = () => `conic-gradient(${colors().join(", ")})`;

  return (
    <ReportStoreProvider reportRoot={props.root}>
      <main
        style={{ "--conic-gradient": conicGradient() }}
        class={`${styles["report-page"]} page glowing`}
      >
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
