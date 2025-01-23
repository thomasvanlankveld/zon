import { For, Setter } from "solid-js";
import { ValueOf } from "../../../utils/type";
import { useI18n } from "../../../utils/i18n";
import styles from "./ReportList.module.css";

export const TabKey = {
  Content: "CONTENT",
  Types: "TYPES",
  Languages: "LANGUAGES",
};
export type TabKey = ValueOf<typeof TabKey>;

const Tabs = {
  [TabKey.Content]: {
    key: TabKey.Content,
    label: "content.label",
  },
  [TabKey.Types]: {
    key: TabKey.Types,
    label: "types.label",
  },
  [TabKey.Languages]: {
    key: TabKey.Languages,
    label: "languages.label",
  },
};

type TabListProps = {
  selectedTab: TabKey;
  setSelectedTab: Setter<TabKey>;
};

export default function TabList(props: TabListProps) {
  const { t } = useI18n();

  return (
    <div role="tablist" class={styles["report-list__tab-list"]}>
      <For each={Object.values(Tabs)}>
        {(tab) => (
          <button
            class={`${styles["report-list__tab"]} text-small`}
            data-selected={props.selectedTab === tab.key}
            onClick={() => props.setSelectedTab(tab.key)}
          >
            {t(tab.label)}
          </button>
        )}
      </For>
    </div>
  );
}
