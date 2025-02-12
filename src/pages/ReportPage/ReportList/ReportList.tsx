import { createSignal } from "solid-js";
import { getDisplayName } from "../../../utils/zon";
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
  const { listRoot } = useReportState();
  const [selectedTab, setSelectedTab] = createSignal<TabKey>(TabKey.Content);

  return (
    <div class="overflow-x-hidden">
      {/* TODO: Maybe this shouldn't be a nav? Check https://a11y-style-guide.com/style-guide/section-navigation.html */}
      <nav
        // TODO: Fix report-list__list being used in two places
        style={{
          padding: "var(--spacing-m)",
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
  );
}
