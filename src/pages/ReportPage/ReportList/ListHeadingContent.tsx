import { Setter } from "solid-js";
import { arePathsEqual, Path, type Node } from "../../../utils/zon";
import styles from "./ReportList.module.css";
import NumberOfLines from "./NumberOfLines";
import DisplayName, { ARROW_BEFORE } from "./DisplayName";
import { getBaseColor } from "../../../utils/zon/color";

type ListHeadingContentProps = {
  isReportRoot: boolean;
  listRoot: Node;
  diagramRootPath: Path;
  highlightedPath: Path | null;
  setHoverListPath: Setter<Path | null>;
};

export default function ListHeadingContent(props: ListHeadingContentProps) {
  function beforeContent() {
    if (
      props.isReportRoot ||
      !arePathsEqual(props.listRoot.path, props.highlightedPath)
    ) {
      return "";
    }

    if (arePathsEqual(props.listRoot.path, props.diagramRootPath)) {
      return ARROW_BEFORE.LEFT;
    } else {
      return ARROW_BEFORE.RIGHT;
    }
  }

  function hoverBeforeContent() {
    return !props.isReportRoot ? ARROW_BEFORE.LEFT : "";
  }

  return (
    <h2
      class={`${styles["report-list__heading"]} ${styles["report-list__list-item"]}`}
      style={{
        "--base-color": getBaseColor(
          props.listRoot.colors,
          props.listRoot.path,
          props.highlightedPath,
        ),
        "--highlighted-color": props.listRoot.colors.highlighted,
        "--pressed-color": props.listRoot.colors.pressed,
      }}
      onMouseEnter={() => props.setHoverListPath(props.listRoot.path)}
      onMouseLeave={() => props.setHoverListPath(null)}
    >
      <DisplayName
        style={{
          "--before-content": beforeContent(),
          "--hover-before-content": hoverBeforeContent(),
        }}
        node={props.listRoot}
      />
      <NumberOfLines numberOfLines={props.listRoot.numberOfLines} />
    </h2>
  );
}
