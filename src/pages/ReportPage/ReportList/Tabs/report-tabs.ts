import { ValueOf } from "../../../../utils/type";

export const TabKey = {
  Content: "content",
  Types: "types",
  Languages: "languages",
};
export type TabKey = ValueOf<typeof TabKey>;

export const Tabs = {
  [TabKey.Content]: {
    key: TabKey.Content,
    tabId: "content-tab",
    panelId: "content-panel",
    label: "content.label",
  },
  [TabKey.Types]: {
    key: TabKey.Types,
    tabId: "types-tab",
    panelId: "types-panel",
    label: "types.label",
  },
  [TabKey.Languages]: {
    key: TabKey.Languages,
    tabId: "languages-tab",
    panelId: "languages-panel",
    label: "languages.label",
  },
};
