import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { open } from "@tauri-apps/plugin-shell";
import { createResource, createSignal, Show } from "solid-js";
import { Meta, TARGET, useMeta } from "../../contexts/meta";
import createNavigatorOnline from "../../primitives/createNavigatorOnline";
import Toast, { ToastType } from "../Toast/Toast";
import ToastAction from "../Toast/ToastAction";

const copies = {
  "check.in-progress": "Checking for updates...",
  "check.no-updates": "You're on the latest version of Zon",
  // TODO: check with `navigator.onLine`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine
  "check.error.offline": "To check for updates, connect to the internet",
  "check.error.online": "Failed to check for updates",
  "check.error.online.issue": "Update check failed",
  "download.in-progress": "Downloading updates...",
  "download.error.offline": "To download the update, connect to the internet",
  "download.error.online": "Failed to download the update",
  "download.error.online.issue": "Update download failed",
  "download.success": "Update downloaded",
  "install.in-progress": "Installing updates...",
  "install.error": "Failed to install the update",
  "install.error.issue": "Update installation failed",
  "install.success": "Update installed",
  "relaunch.in-progress": "Restarting application...",
  "relaunch.error": "Failed to restart the application",
  "relaunch.error.issue": "Application restart failed",
  "install.action": "Install and restart",
  "relaunch.action": "Restart now",
  dismiss: "Dismiss",
  retry: "Retry",
  report: "Report issue",
};

let i = 0;

export default function Updater() {
  const meta = useMeta();

  if (meta.target !== TARGET.DESKTOP) {
    throw new Error("Updater is only available on desktop");
  }

  // On Windows, installing an update will close the application, so we prompt the user first. On other platforms, we
  // can install immediately. See https://v2.tauri.app/plugin/updater/#checking-for-updates
  const installImmediately = meta.platform !== "windows";

  const isOnline = createNavigatorOnline();
  const [wasOfflineDuringUpdateCheck, setWasOfflineDuringUpdateCheck] =
    createSignal(false);

  const [update, { refetch: retryCheckForUpdates }] = createResource(
    async function checkForUpdates() {
      try {
        i++;
        if (i === 1) {
          throw new Error("test update");
        }

        return await check();
      } catch (error) {
        setWasOfflineDuringUpdateCheck(!isOnline());
        throw error;
      }
    },
  );

  const [wasOfflineDuringDownload, setWasOfflineDuringDownload] =
    createSignal(false);

  const [hasDownloaded, { refetch: retryDownloadUpdate }] = createResource(
    () => update.state !== "errored" && update(),
    async function maybeDownloadUpdates(updateVal) {
      if (typeof updateVal !== "object" || updateVal == null) {
        return false;
      }

      try {
        i++;
        if (i === 3) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          throw new Error("test download");
        }

        await updateVal.download();
      } catch (error) {
        setWasOfflineDuringDownload(!isOnline());
        throw error;
      }
      return true;
    },
    { initialValue: false },
  );

  const [shouldInstall, setShouldInstall] = createSignal(installImmediately);

  const [hasInstalled, { refetch: retryInstallUpdate }] = createResource(
    () =>
      hasDownloaded.state !== "errored" && hasDownloaded() && shouldInstall(),
    async function maybeInstallUpdate(hasDownloadedAndShouldInstall) {
      if (!hasDownloadedAndShouldInstall) {
        return false;
      }

      i++;
      if (i === 5) {
        throw new Error("test install");
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

  // If we installed the update immediately, we need to prompt the user to relaunch the application.
  const [shouldRelaunch, setShouldRelaunch] = createSignal(!installImmediately);

  const [hasRelaunched, { refetch: retryRelaunch }] = createResource(
    () =>
      hasInstalled.state !== "errored" && hasInstalled() && shouldRelaunch(),
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

  const [hasUserClickedToastAction, setHasUserClickedToastAction] =
    createSignal(false);

  // We want to hide the update process as much as possible. This means the related loading states are hidden until the
  // user explicitly clicks one of the toast actions.
  function toastCallback(callback: () => void) {
    return function onToastActionClick() {
      setHasUserClickedToastAction(true);
      callback();
    };
  }

  function toastProps() {
    if (update.state === "errored" && wasOfflineDuringUpdateCheck()) {
      // TODO: Automatically dismiss after 5 seconds
      return offlineToastProps(
        copies["check.error.offline"],
        () => void retryCheckForUpdates(),
      );
    }

    if (update.state === "errored") {
      return errorToastProps(
        copies["check.error.online"],
        copies["check.error.online.issue"],
        meta,
        update.error as Error,
        toastCallback(() => void retryCheckForUpdates()),
      );
    }

    if (hasDownloaded.state === "errored" && wasOfflineDuringDownload()) {
      return offlineToastProps(
        copies["download.error.offline"],
        () => void retryDownloadUpdate(),
      );
    }

    if (hasDownloaded.state === "errored") {
      return errorToastProps(
        copies["download.error.online"],
        copies["download.error.online.issue"],
        meta,
        hasDownloaded.error as Error,
        toastCallback(() => void retryDownloadUpdate()),
      );
    }

    if (hasInstalled.state === "errored") {
      return errorToastProps(
        copies["install.error"],
        copies["install.error.issue"],
        meta,
        hasInstalled.error as Error,
        toastCallback(() => void retryInstallUpdate()),
      );
    }

    if (hasRelaunched.state === "errored") {
      return errorToastProps(
        copies["relaunch.error"],
        copies["relaunch.error.issue"],
        meta,
        hasRelaunched.error as Error,
        toastCallback(() => void retryRelaunch()),
      );
    }

    if (hasUserClickedToastAction() && update.loading) {
      return loadingToastProps(copies["check.in-progress"]);
    }

    if (hasUserClickedToastAction() && hasDownloaded.loading) {
      return loadingToastProps(copies["download.in-progress"]);
    }

    if (hasUserClickedToastAction() && hasInstalled.loading) {
      return loadingToastProps(copies["install.in-progress"]);
    }

    if (hasUserClickedToastAction() && hasRelaunched.loading) {
      return loadingToastProps(copies["relaunch.in-progress"]);
    }

    if (update.state === "ready" && update() == null) {
      return {
        type: ToastType.Success,
        message: copies["check.no-updates"],
      };
      // console.log(copies["check.no-updates"]);
      // return null;
    }

    if (!installImmediately && update()) {
      return {
        type: ToastType.Success,
        message: copies["download.success"],
        actions: (
          <ToastAction onClick={toastCallback(() => setShouldInstall(true))}>
            {copies["install.action"]}
          </ToastAction>
        ),
        autoDismiss: false,
      };
    }

    if (installImmediately && hasInstalled()) {
      return {
        type: ToastType.Success,
        message: copies["install.success"],
        actions: (
          <ToastAction onClick={toastCallback(() => setShouldRelaunch(true))}>
            {copies["relaunch.action"]}
          </ToastAction>
        ),
        dismissButton: true,
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

function offlineToastProps(toastMessage: string, onRetry: () => void) {
  return {
    type: ToastType.Warning,
    message: toastMessage,
    actions: <ToastAction onClick={onRetry}>{copies["retry"]}</ToastAction>,
    dismissButton: true,
  };
}

function getIssueLink(meta: Meta, error: Error, issueTitle: string) {
  const title = `[${meta.version()}]: ${issueTitle}`;
  const body = [
    "## Technical info",
    "",
    `- Zon version: \`${meta.version()}\``,
    `- OS: \`${meta.target === TARGET.DESKTOP && meta.platform}\``,
    `- Error message: \`${error.message}\``,
    `- Error stack:`,
    `\`\`\`\n${error.stack}\n\`\`\``,
    "",
    "## Additional info",
    "",
    "...",
    "",
  ].join("\n");

  return `https://github.com/thomasvanlankveld/zon/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

function errorToastProps(
  toastMessage: string,
  issueTitle: string,
  meta: Meta,
  error: Error,
  onRetry: () => void,
) {
  return {
    type: ToastType.Error,
    message: toastMessage,
    actions: (
      <>
        <ToastAction onClick={onRetry}>{copies["retry"]}</ToastAction>
        <ToastAction
          onClick={() => void open(getIssueLink(meta, error, issueTitle))}
        >
          {copies["report"]}
        </ToastAction>
      </>
    ),
    autoDismiss: true,
    dismissButton: true,
  };
}

function loadingToastProps(toastMessage: string) {
  return {
    type: ToastType.Info,
    message: toastMessage,
    autoDismiss: false,
  };
}
