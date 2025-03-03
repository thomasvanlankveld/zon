import { useI18n } from "../../contexts/i18n";

export default function LandingPageMainWeb() {
  const { t } = useI18n();

  return <span>{t("landing-page.welcome-message.web")}</span>;
}
