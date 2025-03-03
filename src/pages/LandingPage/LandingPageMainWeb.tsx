import { createSignal, type JSX } from "solid-js";
import ShinyButton from "../../components/ShinyButton/ShinyButton";
import { useI18n } from "../../contexts/i18n";
import { Languages } from "../../utils/tokei";
import {
  createTree,
  getReportPath,
  LINE_TYPE,
  type Node,
} from "../../utils/zon";

type LandingPageMainWebProps = {
  setReport: (path: string, root: Node) => void;
};

export default function LandingPageMainWeb(props: LandingPageMainWebProps) {
  const { t } = useI18n();
  const [text, setText] = createSignal("");

  const onSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> =
    function onSubmit(e) {
      e.preventDefault();
      const notValidated: unknown = JSON.parse(text());

      const languages = notValidated as Languages;
      const reportPath = getReportPath(languages);
      const reportRoot = createTree(reportPath, languages, [
        LINE_TYPE.BLANKS,
        LINE_TYPE.CODE,
        LINE_TYPE.COMMENTS,
      ]);

      props.setReport(reportPath, reportRoot);
    };

  return (
    <>
      {/* TODO: Detect OS and choose appropriate command */}
      {/* TODO: Maybe explain `tokei ./ --output json | pbcopy`? */}
      <span>{t("landing-page.welcome-message.web")}</span>
      <form onSubmit={onSubmit}>
        {/* TODO: Validate input on paste */}
        <input type="text" onInput={(e) => setText(e.target.value)} />
        <ShinyButton type="submit">{t("show-report-button.label")}</ShinyButton>
      </form>
    </>
  );
}
