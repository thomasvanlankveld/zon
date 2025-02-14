import styles from "./UploadButton.module.css";
import { useI18n } from "../../utils/i18n";
import { conicGradient } from "../../utils/zon";
type UploadButtonProps = {
  countLinesInFolder: () => void;
};

export default function UploadButton(props: UploadButtonProps) {
  const { t } = useI18n();

  const gradient = conicGradient();

  return (
    <button
      style={{ "--glow-background": gradient, "--glow-border-radius": "8px" }}
      class={`${styles["upload-button"]} glow glow-hover`}
      onClick={() => props.countLinesInFolder()}
    >
      {t("upload-button.label")}
    </button>
  );
}
