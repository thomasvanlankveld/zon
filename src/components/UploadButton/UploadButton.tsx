import { useI18n } from "../../contexts/i18n";
import ShinyButton from "../ShinyButton/ShinyButton";

type UploadButtonProps = {
  countLinesInFolder: () => void;
};

export default function UploadButton(props: UploadButtonProps) {
  const { t } = useI18n();

  return (
    <ShinyButton onClick={() => props.countLinesInFolder()}>
      {t("upload-button.label")}
    </ShinyButton>
  );
}
