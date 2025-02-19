import { createMemo, createSignal, Show } from "solid-js";
import {
  getDisplayName,
  isFile,
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

type ReportListProps = {
  class?: string;
};

export default function ReportList(props: ReportListProps) {
  const { t } = useI18n();
  const {
    // reportRoot,
    listRoot,
  } = useReportState();
  const [selectedTab, setSelectedTab] = createSignal<TabKey>(TabKey.Content);

  const listRootHasContent = createMemo(() => !isFile(listRoot()));

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
      class={`${styles["report-list__card"]} card overflow-x-hidden ${props.class}`}
      data-heading-only={!listRootHasContent()}
      aria-label={t("report-list.nav.label", {
        name: getDisplayName(listRoot().name, t("group-name")),
      })}
    >
      {/* <div style={{ display: "grid", padding: "var(--spacing-xs)" }}> */}
      <ListHeading hasBottomMargin={listRootHasContent()} />
      {/* </div> */}
      <Show when={listRootHasContent()}>
        <ReportTabList
          selectedTab={selectedTab()}
          setSelectedTab={setSelectedTab}
        />
      </Show>
      <ContentPanel selectedTab={selectedTab()} />
      <LineTypePanel selectedTab={selectedTab()} />
      <LanguagePanel selectedTab={selectedTab()} />
    </nav>
  );
}
