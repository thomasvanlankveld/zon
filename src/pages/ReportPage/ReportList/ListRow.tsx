import { ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { JSX } from "solid-js/h/jsx-runtime";
import resetButtonStyles from "../../../styles/reset-button.module.css";
import { Node } from "../../../utils/zon";
import DisplayName from "./DisplayName";
import NumberOfLines from "./NumberOfLines";
import styles from "./ReportList.module.css";
import Underline from "./Underline";
import { getBaseColor } from "../../../utils/zon/color";
import { useReportStore } from "../ReportPage.store";

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
  const { highlightedListPath, setHoverListPath } = useReportStore();

  function isButton() {
    return props.onClick != null;
  }

  return (
    <Dynamic
      component={isButton() ? "button" : "div"}
      classList={{
        [resetButtonStyles["reset-button"]]: isButton(),
        [styles["report-list__button"]]: isButton(),
        ...props.rowContainerClassList,
      }}
      style={{
        "--base-color": getBaseColor(
          props.node.colors,
          props.node.path,
          highlightedListPath(),
        ),
        "--highlighted-color": props.node.colors.highlighted,
        "--pressed-color": props.node.colors.pressed,
      }}
      onMouseEnter={[setHoverListPath, props.node.path]}
      onMouseLeave={[setHoverListPath, null]}
      onClick={props.onClick}
    >
      <Dynamic
        component={props.rowTextComponent ?? "span"}
        class={styles["report-list__list-row-text"]}
      >
        <DisplayName
          style={{
            "--before-content": props.nameBeforeContent,
            "--hover-before-content": props.nameHoverBeforeContent,
            "--hover-after-content": props.nameHoverAfterContent,
          }}
          node={props.node}
        />
        <NumberOfLines numberOfLines={props.node.numberOfLines} />
      </Dynamic>
      <Underline
        node={props.node}
        numberOfLinesInRoot={props.numberOfLinesInRoot}
      />
    </Dynamic>
  );
}
