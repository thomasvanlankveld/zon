import { Show } from "solid-js";
import { getParentPath } from "../../../utils/zon";
import resetButtonStyles from "../../../styles/reset-button.module.css";
import styles from "./ReportList.module.css";
import ListHeadingContent from "./ListHeadingContent";
import { useReportStore } from "../ReportPage.store";

export default function ListHeading() {
  const { setSelectedRootPath, listRootPath, isListRootReportRoot } =
    useReportStore();

  function onHeadingClick() {
    const target = isListRootReportRoot()
      ? null
      : getParentPath(listRootPath());

    setSelectedRootPath(target);
  }

  function isButton() {
    return !isListRootReportRoot();
  }

  return (
    <Show when={isButton()} fallback={<ListHeadingContent />}>
      <button
        class={`${resetButtonStyles["reset-button"]} ${styles["report-list__button"]}`}
        onClick={() => onHeadingClick()}
      >
        <ListHeadingContent />
      </button>
    </Show>
  );
}
