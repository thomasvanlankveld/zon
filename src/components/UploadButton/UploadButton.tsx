import styles from "./UploadButton.module.css";
import { useI18n } from "../../utils/i18n";
type UploadButtonProps = {
  countLinesInFolder: () => void;
};

export default function UploadButton(props: UploadButtonProps) {
  const { t } = useI18n();

  return (
    <button
      class={styles["upload-button"]}
      onClick={() => props.countLinesInFolder()}
    >
      {t("upload-button.label")}
    </button>
  );
}
