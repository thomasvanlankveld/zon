import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { open } from "@tauri-apps/plugin-shell";
import { createResource, createSignal, Show } from "solid-js";
import { useI18n } from "../../contexts/i18n";
import { Meta, TARGET, useMeta } from "../../contexts/meta";
import createNavigatorOnline from "../../primitives/createNavigatorOnline";
import Toast, { ToastType } from "../Toast/Toast";
import ToastAction from "../Toast/ToastAction";
import createIssueLink from "./createIssueLink";

// // Uncomment this to use a simulator of the updater plugin
// import { check, relaunch } from "./updaterSim";

/**
 * This component, when mounted, will automatically check for updates and download them. Install and restart
 * happen only after the user confirms once (e.g. "Install and restart"); one click upgrades to the new version.
 *
 * It will also show a toast to the user when necessary:
 * - When there is a problem
 * - When the user's permission is needed to proceed (before install and restart)
 * - After any user interaction, to show the updater's progress
 *
 * What the Zon app does is very specific, so we don't want to bother the user with update-related stuff
 * unless we really need to. Whenever we do show a message, it's usually dismissed automatically.
 */
export default function Updater() {
  const meta = useMeta();
  console.log("Zon app current version", meta.version);

  const { t } = useI18n();

  if (meta.target !== TARGET.DESKTOP) {
    throw new Error("Updater is only available on desktop");
  }

  const isOnline = createNavigatorOnline();
  const [wasOfflineDuringUpdateCheck, setWasOfflineDuringUpdateCheck] =
    createSignal(false);

  // Check for updates
  const [update, { refetch: retryCheckForUpdates }] = createResource(
    async function checkForUpdates() {
      try {
        return await check();
      } catch (error) {
        setWasOfflineDuringUpdateCheck(!isOnline());
        throw error;
      }
    },
  );

  const [wasOfflineDuringDownload, setWasOfflineDuringDownload] =
    createSignal(false);

  // Download updates
  const [hasDownloaded, { refetch: retryDownloadUpdate }] = createResource(
    () => update.state !== "errored" && update(),
    async function maybeDownloadUpdates(updateVal) {
      if (typeof updateVal !== "object" || updateVal == null) {
        return false;
      }

      console.log("Zon app update found", updateVal.version);

      try {
        await updateVal.download();
      } catch (error) {
        setWasOfflineDuringDownload(!isOnline());
        throw error;
      }
      return true;
    },
    { initialValue: false },
  );

  // Install and relaunch only after the user confirms (one action for both).
  const [shouldInstallAndRelaunch, setShouldInstallAndRelaunch] =
    createSignal(false);

  const [hasInstalled, { refetch: retryInstallUpdate }] = createResource(
    () =>
      hasDownloaded.state !== "errored" &&
      hasDownloaded() &&
      shouldInstallAndRelaunch(),
    async function maybeInstallUpdate(hasDownloadedAndShouldInstall) {
      if (!hasDownloadedAndShouldInstall) {
        return false;
      }

      const updateVal = update();

      if (updateVal == null) {
        throw new Error("No update to install");
      }

      await updateVal.install();
      return true;
    },
    { initialValue: false },
  );

  const [hasRelaunched, { refetch: retryRelaunch }] = createResource(
    () =>
      hasInstalled.state !== "errored" &&
      hasInstalled() &&
      shouldInstallAndRelaunch(),
    async function maybeRelaunch(hasInstalledAndShouldRelaunch) {
      if (!hasInstalledAndShouldRelaunch) {
        return false;
      }

      if (update() == null) {
        throw new Error(
          "Should not be able to relaunch if no update is installed",
        );
      }

      if (!hasDownloaded()) {
        throw new Error(
          "Should not be able to relaunch if update has not been downloaded",
        );
      }

      await relaunch();
      return true;
    },
    { initialValue: false },
  );

  // We want to hide the update process as much as possible. This means the related loading states are hidden until the
  // user explicitly clicks one of the toast actions.
  const [hasUserClickedToastAction, setHasUserClickedToastAction] =
    createSignal(false);

  function toastCallback(callback: () => void) {
    return function onToastActionClick() {
      setHasUserClickedToastAction(true);
      callback();
    };
  }

  /**
   * Updater variable toast props
   *
   * Will choose the appropriate message etc. based on the current state of the updater.
   *
   * First priority is error messages, then loading messages, then requests for confirmation.
   *
   * If none of these apply, the updater will not show a toast.
   */
  function toastProps() {
    if (update.state === "errored" && wasOfflineDuringUpdateCheck()) {
      return offlineToastProps(
        t("updater.check.error.offline"),
        toastCallback(() => void retryCheckForUpdates()),
      );
    }

    if (update.state === "errored") {
      return errorToastProps(
        t("updater.check.error.online"),
        t("updater.check.error.online.issue"),
        meta,
        update.error as Error,
        toastCallback(() => void retryCheckForUpdates()),
      );
    }

    if (hasDownloaded.state === "errored" && wasOfflineDuringDownload()) {
      return offlineToastProps(
        t("updater.download.error.offline"),
        toastCallback(() => void retryDownloadUpdate()),
      );
    }

    if (hasDownloaded.state === "errored") {
      return errorToastProps(
        t("updater.download.error.online"),
        t("updater.download.error.online.issue"),
        meta,
        hasDownloaded.error as Error,
        toastCallback(() => void retryDownloadUpdate()),
      );
    }

    if (hasInstalled.state === "errored") {
      return errorToastProps(
        t("updater.install.error"),
        t("updater.install.error.issue"),
        meta,
        hasInstalled.error as Error,
        toastCallback(() => void retryInstallUpdate()),
      );
    }

    if (hasRelaunched.state === "errored") {
      return errorToastProps(
        t("updater.relaunch.error"),
        t("updater.relaunch.error.issue"),
        meta,
        hasRelaunched.error as Error,
        toastCallback(() => void retryRelaunch()),
      );
    }

    if (hasUserClickedToastAction() && update.loading) {
      return loadingToastProps(t("updater.check.in-progress"));
    }

    if (hasUserClickedToastAction() && hasDownloaded.loading) {
      return loadingToastProps(t("updater.download.in-progress"));
    }

    if (hasUserClickedToastAction() && hasInstalled.loading) {
      return loadingToastProps(t("updater.install.in-progress"));
    }

    if (hasUserClickedToastAction() && hasRelaunched.loading) {
      return loadingToastProps(t("updater.relaunch.in-progress"));
    }

    if (
      hasUserClickedToastAction() &&
      update.state === "ready" &&
      update() == null
    ) {
      return {
        type: ToastType.Success,
        message: t("updater.check.no-updates"),
      };
    }

    if (update() && hasDownloaded() && !shouldInstallAndRelaunch()) {
      return {
        type: ToastType.Success,
        message: t("updater.download.success"),
        actions: (
          <ToastAction
            onClick={toastCallback(() => setShouldInstallAndRelaunch(true))}
          >
            {t("updater.install.action")}
          </ToastAction>
        ),
        autoDismiss: false,
      };
    }

    return null;
  }

  return (
    <Show when={toastProps()}>
      {(toastPropsVal) => (
        <Toast closeButton autoDismiss {...toastPropsVal()} />
      )}
    </Show>
  );
}

/**
 * Updater offline toast props
 */
function offlineToastProps(toastMessage: string, onRetry: () => void) {
  const { t } = useI18n();

  return {
    type: ToastType.Warning,
    message: toastMessage,
    actions: <ToastAction onClick={onRetry}>{t("retry.action")}</ToastAction>,
    dismissButton: true,
  };
}

/**
 * Updater error toast props
 */
function errorToastProps(
  toastMessage: string,
  issueTitle: string,
  meta: Meta,
  error: Error,
  onRetry: () => void,
) {
  const { t } = useI18n();

  return {
    type: ToastType.Error,
    message: toastMessage,
    actions: (
      <>
        <ToastAction onClick={onRetry}>{t("retry.action")}</ToastAction>
        <ToastAction
          onClick={() => void open(createIssueLink(meta, error, issueTitle))}
        >
          {t("report.action")}
        </ToastAction>
      </>
    ),
    autoDismiss: true,
    dismissButton: true,
  };
}

/**
 * Updater loading toast props
 */
function loadingToastProps(toastMessage: string) {
  return {
    type: ToastType.Info,
    message: toastMessage,
    autoDismiss: false,
  };
}
