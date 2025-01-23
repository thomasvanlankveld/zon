import { For, Setter } from "solid-js";
import { ValueOf } from "../../../utils/type";
import { useI18n } from "../../../utils/i18n";

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
    <div
      role="tablist"
      style={{
        display: "flex",
        "column-gap": "var(--spacing-l)",
        "justify-content": "end",
        "flex-direction": "row-reverse",
      }}
    >
      <For each={Object.values(Tabs)}>
        {(tab) => (
          <button
            style={{
              "padding-block": "var(--spacing-s)",
              color:
                tab.key === props.selectedTab
                  ? "var(--color-text-regular)"
                  : "var(--color-text-extra-muted)",
            }}
            class="text-small"
            onClick={() => props.setSelectedTab(tab.key)}
          >
            {/* <Show when={tab.key === activeTab()} fallback={"• "}>
                          ◉{" "}
                        </Show> */}
            {t(tab.label)}
            {/* <Show when={tab.key === activeTab()} fallback={" •"}>
                          {" "}
                          ◉
                        </Show> */}
            {/* <Show when={tab.key === activeTab()} fallback={"."}>
                          {":"}
                        </Show> */}
          </button>
        )}
      </For>
    </div>
  );
}
