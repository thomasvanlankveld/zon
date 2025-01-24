import { createMemo, JSX, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { getNodeTextColors, Node } from "../../../utils/zon";
import NumberOfLines from "../../../components/NumberOfLines";
import styles from "./ReportList.module.css";
import Underline from "./Underline";
import { useReportState } from "../ReportPage.state";

type ListRowProps = {
  node: Node;
  rowContainerClassList?: { [k: string]: boolean | undefined };
  rowTextComponent?: ValidComponent;
  name: JSX.Element;
  nameBeforeContent?: string;
  nameHoverBeforeContent?: string;
  nameHoverAfterContent?: string;
  numberOfLinesInRow: number;
  numberOfLinesInRoot: number;
  onMouseEnter?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  onMouseLeave?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
};

export default function ListRow(props: ListRowProps) {
  const { reportRoot, highlightedListPath } = useReportState();

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
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onClick={props.onClick}
    >
      <Dynamic
        component={props.rowTextComponent ?? "span"}
        class={styles["report-list__row-text"]}
      >
        <span
          style={{
            "--before-content": props.nameBeforeContent,
            "--hover-before-content": props.nameHoverBeforeContent,
            "--hover-after-content": props.nameHoverAfterContent,
          }}
          class={`${styles["report-list__row-name"]} truncate`}
        >
          {props.name}
        </span>
        <NumberOfLines
          class="ml-auto"
          numberOfLines={props.numberOfLinesInRow}
        />
      </Dynamic>
      <Underline
        numberOfLinesInRow={props.numberOfLinesInRow}
        numberOfLinesInRoot={props.numberOfLinesInRoot}
      />
    </Dynamic>
  );
}
