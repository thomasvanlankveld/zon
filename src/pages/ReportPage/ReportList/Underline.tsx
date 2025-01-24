import styles from "./ReportList.module.css";

type UnderlineProps = {
  numberOfLinesInRow: number;
  numberOfLinesInRoot: number;
};

export default function Underline(props: UnderlineProps) {
  function barWidth() {
    return `${(props.numberOfLinesInRow / props.numberOfLinesInRoot) * 100}%`;
  }

  return (
    <div
      class={styles["report-list__item-underline"]}
      style={{ width: barWidth() }}
    />
  );
}
