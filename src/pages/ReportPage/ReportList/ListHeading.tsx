import { getNodeByPath, getParentPath, NODE_TYPE } from "../../../utils/zon";
import resetButtonStyles from "../../../styles/reset-button.module.css";
import styles from "./ReportList.module.css";
import ListHeadingContent from "./ListHeadingContent";
import { useReportStore } from "../ReportPage.store";
import Underline from "./Underline";
import { Dynamic } from "solid-js/web";
import { getBaseColor } from "../../../utils/zon/color";

export default function ListHeading() {
  const {
    reportRoot,
    navigate,
    listRoot,
    listRootPath,
    highlightedListPath,
    isListRootReportRoot,
    setHoverListPath,
  } = useReportStore();

  function isButton() {
    return !isListRootReportRoot();
  }

  function onClick() {
    const target = isListRootReportRoot()
      ? null
      : getParentPath(listRootPath());

    navigate(target);
  }

  function numberOfLinesInRoot() {
    const root =
      listRoot().type === NODE_TYPE.GROUP
        ? getNodeByPath(reportRoot(), getParentPath(listRootPath()))
        : listRoot();

    return root.numberOfLines;
  }

  return (
    <Dynamic
      component={isButton() ? "button" : "div"}
      classList={{
        [styles["report-list__heading"]]: true,
        [resetButtonStyles["reset-button"]]: isButton(),
        [styles["report-list__button"]]: isButton(),
      }}
      style={{
        "--base-color": getBaseColor(
          listRoot().colors,
          listRoot().path,
          highlightedListPath(),
        ),
        "--highlighted-color": listRoot().colors.highlighted,
        "--pressed-color": listRoot().colors.pressed,
      }}
      onMouseEnter={[setHoverListPath, listRoot().path]}
      onMouseLeave={[setHoverListPath, null]}
      onClick={() => onClick()}
    >
      <ListHeadingContent />
      <Underline
        node={listRoot()}
        numberOfLinesInRoot={numberOfLinesInRoot()}
      />
    </Dynamic>
  );
}
