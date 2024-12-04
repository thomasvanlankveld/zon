import styles from "./UploadButton.module.css";
import { useTranslations } from "../../utils/translations";
type UploadButtonProps = {
  countLinesInFolder: () => void;
};

export default function UploadButton(props: UploadButtonProps) {
  const { t } = useTranslations();

  return (
    <button
      class={styles["upload-button"]}
      onClick={() => props.countLinesInFolder()}
    >
      {t("upload-button.label")}
    </button>
  );
}
