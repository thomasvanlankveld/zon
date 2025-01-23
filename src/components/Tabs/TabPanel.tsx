import { JSX } from "solid-js";
import styles from "./Tabs.module.css";

type TabPanelProps = {
  id: string;
  class?: string;
  tabId: string;
  selected: boolean;
  children: JSX.Element;
};

export default function TabPanel(props: TabPanelProps) {
  return (
    <div
      id={props.id}
      role="tabpanel"
      class={`${styles["tabpanel"]} ${props.class}`}
      aria-labelledby={props.tabId}
      data-selected={props.selected}
    >
      {props.children}
    </div>
  );
}
