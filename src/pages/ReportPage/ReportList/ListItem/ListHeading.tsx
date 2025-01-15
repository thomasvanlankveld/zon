import { createMemo, Setter } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  arePathsEqual,
  getParentPath,
  Path,
  type Node,
} from "../../../../utils/zon";
import resetButtonStyles from "../../../../styles/reset-button.module.css";
import styles from "./ListItem.module.css";
import NumberOfLines from "./NumberOfLines";
import DisplayName from "./DisplayName";
import { getBaseColor } from "../../../../utils/zon/color";

type ListHeadingProps = {
  listRoot: Node;
  reportRootPath: Path;
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

  // TODO: Set arrows also on "highlight match"
  function hoverBeforeContent() {
    return isReportRoot() ? "" : '"<- "';
  }

  function isButton() {
    return !isReportRoot();
  }

  return (
    // TODO: Get rid of span
    // TODO: Add h2
    <Dynamic
      component={isButton() ? "button" : "span"}
      classList={{
        [styles["list-item"]]: true,
        [styles["list-heading"]]: true,
        [resetButtonStyles["reset-button"]]: isButton(),
        [styles["list-item__button"]]: isButton(),
      }}
      style={{
        "--base-color": getBaseColor(
          props.listRoot.colors,
          props.listRoot.path,
          props.highlightedPath,
        ),
        "--highlighted-color": props.listRoot.colors.highlighted,
        "--pressed-color": props.listRoot.colors.pressed,
      }}
      onMouseEnter={[props.setHoverListPath, props.listRoot.path]}
      onMouseLeave={[props.setHoverListPath, null]}
      onClick={() => onHeadingClick()}
    >
      <DisplayName
        style={{
          "--hover-before-content": hoverBeforeContent(),
        }}
        node={props.listRoot}
      />
      <NumberOfLines numberOfLines={props.listRoot.numberOfLines} />
    </Dynamic>
  );
}
