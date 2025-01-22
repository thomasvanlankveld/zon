import { createMemo, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { JSX } from "solid-js/h/jsx-runtime";
import { getNodeTextColors, Node } from "../../../utils/zon";
import NumberOfLines from "../../../components/NumberOfLines";
import DisplayName from "./DisplayName";
import styles from "./ReportList.module.css";
import Underline from "./Underline";
import { useReportState } from "../ReportPage.state";

type ListRowProps = {
  node: Node;
  numberOfLinesInRoot: number;
  rowContainerClassList?: { [k: string]: boolean | undefined };
  rowTextComponent?: ValidComponent;
  nameBeforeContent?: string;
  nameHoverBeforeContent?: string;
  nameHoverAfterContent?: string;
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
};

export default function ListRow(props: ListRowProps) {
  const { reportRoot, highlightedListPath, setHoverListPath } =
    useReportState();

  function isButton() {
    return props.onClick != null;
  }

  const colors = createMemo(() =>
    getNodeTextColors(props.node, reportRoot().path, highlightedListPath()),
  );

  return (
    <Dynamic
      component={isButton() ? "button" : "div"}
      classList={{
        "overflow-x-hidden": true,
        [styles["report-list__row-wrapper"]]: true,
        [styles["report-list__button"]]: isButton(),
        ...props.rowContainerClassList,
      }}
      style={{
        "--base-color": colors().base,
        "--highlight-color": colors().highlight,
        "--press-color": colors().press,
      }}
      onMouseEnter={[setHoverListPath, props.node.path]}
      onMouseLeave={[setHoverListPath, null]}
      onClick={props.onClick}
    >
      <Dynamic
        component={props.rowTextComponent ?? "span"}
        class={styles["report-list__row-text"]}
      >
        <DisplayName
          style={{
            "--before-content": props.nameBeforeContent,
            "--hover-before-content": props.nameHoverBeforeContent,
            "--hover-after-content": props.nameHoverAfterContent,
          }}
          node={props.node}
        />
        <NumberOfLines
          class="ml-auto"
          numberOfLines={props.node.numberOfLines}
        />
      </Dynamic>
      <Underline
        node={props.node}
        numberOfLinesInRoot={props.numberOfLinesInRoot}
      />
    </Dynamic>
  );
}
