import { For } from "solid-js";
import { TabKey } from "../Tabs/report-tabs";
import ReportTabPanel from "../Tabs/ReportTabPanel";
import { useReportState } from "../../ReportPage.state";
import { isFile, isFolder, isGroup } from "../../../../utils/zon";
import ContentRow from "./ContentRow";
import styles from "../ReportList.module.css";

type ContentPanelProps = {
  selectedTab: TabKey;
};

export default function ContentPanel(props: ContentPanelProps) {
  const { listRoot } = useReportState();

  const listNodes = () => {
    const root = listRoot();

    if (isFile(root)) {
      return [];
    }

    if (isGroup(root)) {
      return root.groupedChildren;
    }

    if (isFolder(root)) {
      return root.children;
    }

    throw new Error(`Node has unknown type`);
  };

  return (
    <ReportTabPanel
      class={styles["report-list__tab-panel"]}
      tab={TabKey.Content}
      selectedTab={props.selectedTab}
    >
      <For each={listNodes()}>
        {(child) => (
          <ContentRow
            node={child}
            numberOfLinesInRoot={listRoot().numberOfLines}
          />
        )}
      </For>
    </ReportTabPanel>
  );
}
