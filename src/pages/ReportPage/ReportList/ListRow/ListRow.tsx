import { JSX, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import NumberOfLines from "../../../../components/NumberOfLines";
import styles from "../ReportList.module.css";
import Underline from "./Underline";

export type ListRowColors = {
  base: string;
  highlight: string;
  active: string;
  deemphasize?: string;
};

type ListRowProps = {
  colors?: ListRowColors;
  rowContainerClassList?: { [k: string]: boolean | undefined };
  rowTextComponent?: ValidComponent;
  name: JSX.Element;
  isDeemphasized?: boolean;
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
  function isButton() {
    return props.onClick != null;
  }

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
        "--base-color": props.colors?.base ?? "var(--color-text-regular)",
        "--highlight-color":
          props.colors?.highlight ?? "var(--color-text-hover-focus)",
        "--active-color": props.colors?.active ?? "var(--color-text-active)",
        "--deemphasize-color":
          props.colors?.deemphasize ?? "var(--color-text-deemphasize)",
      }}
      data-deemphasized={props.isDeemphasized ?? false}
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
