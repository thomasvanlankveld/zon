import { JSX } from "solid-js";
import styles from "./Tabs.module.css";

type TabProps = {
  id: string;
  class?: string;
  panelId: string;
  selected: boolean;
  onClick?: (e: MouseEvent) => void;
  children: JSX.Element;
};

export default function Tab(props: TabProps) {
  return (
    <button
      id={props.id}
      role="tab"
      class={`${props.class} ${styles["tab"]} text-small`}
      aria-controls={props.panelId}
      data-selected={props.selected}
      tabindex={props.selected ? "0" : "-1"}
      onClick={(e) => props.onClick?.(e)}
    >
      {props.children}
    </button>
  );
}
