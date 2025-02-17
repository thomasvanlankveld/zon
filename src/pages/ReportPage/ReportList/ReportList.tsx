import { createSignal } from "solid-js";
import {
  getDisplayName,
  // rainbow
} from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";
import { useReportState } from "../ReportPage.state";
import styles from "./ReportList.module.css";
import ListHeading from "./ListHeading";
import ReportTabList from "./Tabs/ReportTabList";
import { TabKey } from "./Tabs/report-tabs";
import ContentPanel from "./Content/ContentPanel";
import LineTypePanel from "./LineType/LineTypePanel";
import LanguagePanel from "./Language/LanguagePanel";

export default function ReportList() {
  const { t } = useI18n();
  const {
    // reportRoot,
    listRoot,
  } = useReportState();
  const [selectedTab, setSelectedTab] = createSignal<TabKey>(TabKey.Content);

  // const numberOfColors = 16;
  // const step = () =>
  //   listRoot().numberOfLines / reportRoot().numberOfLines / numberOfColors;

  // function getPosition(i: number) {
  //   return listRoot().firstLine / reportRoot().numberOfLines + i * step();
  // }

  // const colors = () =>
  //   // Add one so that the first color is the same as the last
  //   Array.from({ length: numberOfColors + 1 })
  //     .fill(null)
  //     .map((_, i) => rainbow(getPosition(i)).regular);
  // const linearGradient = () => `linear-gradient(${colors().join(", ")})`;

  // TODO: Maybe this shouldn't be a nav? Check https://a11y-style-guide.com/style-guide/section-navigation.html
  return (
    <nav
      // TODO: Fix report-list__tab-panel being used in two places
      style={{
        // TODO: Inject two lines below from report
        "align-self": "start",
        "max-height": "100%",
        // TODO: Inject two lines above from report

        // TODO: Move below lines into `card` component class
        "border-radius": "var(--spacing-xxl)",
        "padding-block": "var(--spacing-xxl)",
        "padding-inline": "var(--spacing-xxl)",
        // "padding-block": "var(--spacing-xl)",
        // "padding-inline": "var(--spacing-xl)",
        "background-color": "var(--color-background)",
        // TODO: Move above lines into `card` component class

        display: "grid",
        "grid-template-rows": "min-content min-content 1fr",
        gap: "var(--spacing-xs)",
      }}
      class={`${styles["report-list__card"]} overflow-x-hidden`}
      aria-label={t("report-list.nav.label", {
        name: getDisplayName(listRoot().name, t("group-name")),
      })}
    >
      {/* <div style={{ display: "grid", padding: "var(--spacing-xs)" }}> */}
      <ListHeading />
      {/* </div> */}
      <ReportTabList
        selectedTab={selectedTab()}
        setSelectedTab={setSelectedTab}
      />
      <ContentPanel selectedTab={selectedTab()} />
      <LineTypePanel selectedTab={selectedTab()} />
      <LanguagePanel selectedTab={selectedTab()} />
    </nav>
  );
}
