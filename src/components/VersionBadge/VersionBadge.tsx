import { Show } from "solid-js";
import { useI18n } from "../../contexts/i18n";
import { useMeta } from "../../contexts/meta";
import styles from "./VersionBadge.module.css";

/**
 * Displays the app title and version in the bottom-left corner of the screen.
 * Only renders when the version has been resolved from meta.
 */
export default function VersionBadge() {
  const { t } = useI18n();
  const meta = useMeta();
  const version = meta.version;

  return (
    <Show when={version()}>
      {(v) => (
        <span
          class={styles["version-badge"]}
          aria-label={`${t("app.title")} version ${v()}`}
        >
          {t("app.title")} v{v()}
        </span>
      )}
    </Show>
  );
}
