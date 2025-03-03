import styles from "./UploadButton.module.css";
import { useI18n } from "../../contexts/i18n";

type UploadButtonProps = {
  countLinesInFolder: () => void;
};

export default function UploadButton(props: UploadButtonProps) {
  const { t } = useI18n();

  return (
    <button
      style={{ "--glimmer-border-radius": "8px" }}
      class={`${styles["upload-button"]} glimmer glimmer-hover glow`}
      onClick={() => props.countLinesInFolder()}
    >
      {t("upload-button.label")}
    </button>
  );
}
