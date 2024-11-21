import styles from "./UploadButton.module.css";

type UploadButtonProps = {
  countLinesInFolder: () => void;
};

export default function UploadButton(props: UploadButtonProps) {
  return (
    <button
      class={styles["upload-button"]}
      onClick={() => props.countLinesInFolder()}
    >
      Select folder
    </button>
  );
}
