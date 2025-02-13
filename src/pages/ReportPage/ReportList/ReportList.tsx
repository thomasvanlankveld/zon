import { createSignal } from "solid-js";
import { getDisplayName, rainbow } from "../../../utils/zon";
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
  const { reportRoot, listRoot } = useReportState();
  const [selectedTab, setSelectedTab] = createSignal<TabKey>(TabKey.Content);

  const numberOfColors = 16;
  const step = () =>
    listRoot().numberOfLines / reportRoot().numberOfLines / numberOfColors;

  function getPosition(i: number) {
    return listRoot().firstLine / reportRoot().numberOfLines + i * step();
  }

  const colors = () =>
    // Add one so that the first color is the same as the last
    Array.from({ length: numberOfColors + 1 })
      .fill(null)
      .map((_, i) => rainbow(getPosition(i)).regular);
  const linearGradient = () => `linear-gradient(${colors().join(", ")})`;

  return (
    // <div class="overflow-x-hidden">
    <div>
      {/* TODO: Maybe this shouldn't be a nav? Check https://a11y-style-guide.com/style-guide/section-navigation.html */}
      <div
        style={{
          "--glow-background": linearGradient(),
          "--glow-opacity": "0.2",
        }}
        class="glow"
      >
        <nav
          // TODO: Fix report-list__list being used in two places
          style={{
            padding: "var(--spacing-xl)",
            "background-color": "var(--color-background)",
          }}
          class={`${styles["report-list__list"]} overflow-x-hidden`}
          aria-label={t("report-list.nav.label", {
            name: getDisplayName(listRoot().name, t("group-name")),
          })}
        >
          <ListHeading />
          <ReportTabList
            selectedTab={selectedTab()}
            setSelectedTab={setSelectedTab}
          />
          <ContentPanel selectedTab={selectedTab()} />
          <LineTypePanel selectedTab={selectedTab()} />
          <LanguagePanel selectedTab={selectedTab()} />
        </nav>
      </div>
    </div>
  );
}
