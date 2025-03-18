import { useI18n } from "../../contexts/i18n";
import Button from "../Button/Button";

type UploadButtonProps = {
  countLinesInFolder: () => void;
};

export default function UploadButton(props: UploadButtonProps) {
  const { t } = useI18n();

  return (
    <Button variant="shiny" onClick={() => props.countLinesInFolder()}>
      {t("upload-button.label")}
    </Button>
  );
}
