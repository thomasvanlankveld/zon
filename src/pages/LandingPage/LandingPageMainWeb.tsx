import { createSignal, type JSX } from "solid-js";
import ShinyButton from "../../components/ShinyButton/ShinyButton";
import { useI18n } from "../../contexts/i18n";

export default function LandingPageMainWeb() {
  const { t } = useI18n();
  const [text, setText] = createSignal("");

  const onSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> =
    function onSubmit(e) {
      e.preventDefault();
      console.log(JSON.parse(text()));
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
