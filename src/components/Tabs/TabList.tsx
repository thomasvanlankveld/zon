import { JSX } from "solid-js";
import styles from "./Tabs.module.css";

type TabListProps = {
  children: JSX.Element;
};

export default function TabList(props: TabListProps) {
  return (
    <div role="tablist" class={styles["tab-list"]}>
      {props.children}
    </div>
  );
}
