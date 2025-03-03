import { createSignal, type JSX } from "solid-js";
import ShinyButton from "../../components/ShinyButton/ShinyButton";
import { useI18n } from "../../contexts/i18n";
import { Languages } from "../../utils/tokei";
import { getReportPath } from "../../utils/zon";

export default function LandingPageMainWeb() {
  const { t } = useI18n();
  const [text, setText] = createSignal("");

  const onSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> =
    function onSubmit(e) {
      e.preventDefault();
      const notValidated: unknown = JSON.parse(text());

      const languages = notValidated as Languages;
      const reportPath = getReportPath(languages);

      console.log({ reportPath, languages });
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
