import { Node } from "../../../utils/zon";
import styles from "./ReportList.module.css";

type UnderlineProps = {
  node: Node;
  numberOfLinesInRoot: number;
};

export default function Underline(props: UnderlineProps) {
  function barWidth() {
    return `${(props.node.numberOfLines / props.numberOfLinesInRoot) * 100}%`;
  }

  return (
    <div
      class={styles["report-list__item-underline"]}
      style={{ width: barWidth() }}
    />
  );
}
