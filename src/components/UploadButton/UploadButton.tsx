import { useI18n } from "../../contexts/i18n";
import { useUpdateContext } from "../../contexts/update";
import Button from "../Button/Button";

type UploadButtonProps = {
  countLinesInFolder: () => void;
};

export default function UploadButton(props: UploadButtonProps) {
  const { t } = useI18n();
  const ctx = useUpdateContext();

  return (
    <Button
      variant="shiny"
      disabled={ctx.isPendingRestart()}
      onClick={() => props.countLinesInFolder()}
    >
      {t("upload-button.label")}
    </Button>
  );
}
