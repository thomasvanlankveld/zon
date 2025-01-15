import { createMemo, Setter, Show } from "solid-js";
import {
  arePathsEqual,
  getParentPath,
  Path,
  type Node,
} from "../../../utils/zon";
import resetButtonStyles from "../../../styles/reset-button.module.css";
import styles from "./ReportList.module.css";
import NumberOfLines from "./NumberOfLines";
import DisplayName, { ARROW_BEFORE } from "./DisplayName";
import { getBaseColor } from "../../../utils/zon/color";

const buttonStyles = `${resetButtonStyles["reset-button"]} ${styles["report-list__button"]}`;

type ListHeadingProps = {
  listRoot: Node;
  reportRootPath: Path;
  diagramRootPath: Path;
  highlightedPath: Path | null;
  setHoverListPath: Setter<Path | null>;
  setSelectedRootPath: Setter<Path | null>;
};

export default function ListHeading(props: ListHeadingProps) {
  const isReportRoot = createMemo(() =>
    arePathsEqual(props.listRoot.path, props.reportRootPath),
  );

  function onHeadingClick() {
    const target = isReportRoot() ? null : getParentPath(props.listRoot.path);

    props.setSelectedRootPath(target);
  }

  function isButton() {
    return !isReportRoot();
  }

  return (
    <Show
      when={isButton()}
      fallback={
        <ListHeadingContent
          isReportRoot={isReportRoot()}
          listRoot={props.listRoot}
          diagramRootPath={props.diagramRootPath}
          highlightedPath={props.highlightedPath}
          setHoverListPath={props.setHoverListPath}
        />
      }
    >
      <button class={buttonStyles} onClick={() => onHeadingClick()}>
        <ListHeadingContent
          isReportRoot={isReportRoot()}
          listRoot={props.listRoot}
          diagramRootPath={props.diagramRootPath}
          highlightedPath={props.highlightedPath}
          setHoverListPath={props.setHoverListPath}
        />
      </button>
    </Show>
  );
}

const headingStyles = `${styles["report-list__heading"]} ${styles["report-list__list-item"]}`;

type ListHeadingContentProps = {
  isReportRoot: boolean;
  listRoot: Node;
  diagramRootPath: Path;
  highlightedPath: Path | null;
  setHoverListPath: Setter<Path | null>;
};

function ListHeadingContent(props: ListHeadingContentProps) {
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
      class={headingStyles}
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
