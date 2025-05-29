import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { createResource, createSignal, Show } from "solid-js";
import createNavigatorOnline from "../../primitives/createNavigatorOnline";
import Toast, { ToastType } from "../Toast/Toast";
import ToastAction from "../Toast/ToastAction";

const copies = {
  "check.in-progress": "Checking for updates...",
  "check.no-updates": "You're on the latest version of Zon",
  // TODO: check with `navigator.onLine`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine
  "check.error.offline": "To check for updates, connect to the internet",
  "check.error.online": (link: string, message: string) =>
    `Something went wrong while checking for updates. Please submit an issue at "${link}" mentioning the cause "${message}"`,
  "download.in-progress": "Downloading updates...",
  "download.error": "Failed to download the update. Please try again later.",
  "download.success": "Update downloaded",
  "install.in-progress": "Installing updates...",
  "install.error": "Failed to install the update",
  "relaunch.in-progress": "Restarting application...",
  "relaunch.error": "Failed to restart the application",
  "install.action": "Install and restart",
  dismiss: "Dismiss",
  retry: "Retry",
};

export default function Updater() {
  const isOnline = createNavigatorOnline();
  const [wasOfflineDuringUpdateCheck, setWasOfflineDuringUpdateCheck] =
    createSignal(false);

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

  const [hasDownloaded, { refetch: retryDownloadUpdate }] = createResource(
    () => update.state !== "errored" && update(),
    async function maybeDownloadUpdates(updateVal) {
      if (typeof updateVal !== "object" || updateVal == null) {
        return false;
      }

      await updateVal.download();
      return true;
    },
    { initialValue: false },
  );

  const [shouldInstall, setShouldInstall] = createSignal(false);

  const [hasInstalled, { refetch: retryInstallUpdate }] = createResource(
    shouldInstall,
    async function maybeInstallUpdate(shouldInstallVal) {
      if (!shouldInstallVal) {
        return false;
      }

      const updateVal = update();

      if (updateVal == null) {
        throw new Error("No update to install");
      }

      if (!hasDownloaded()) {
        throw new Error("Cannot install update that has not been downloaded");
      }

      await updateVal.install();
      return true;
    },
    { initialValue: false },
  );

  const [hasRelaunched, { refetch: retryRelaunch }] = createResource(
    () => hasInstalled(),
    async function maybeRelaunch(hasInstalledVal) {
      if (!hasInstalledVal) {
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

  function toastProps() {
    if (update.state === "errored" && wasOfflineDuringUpdateCheck()) {
      // TODO: Automatically dismiss after 5 seconds
      return {
        type: ToastType.Warning,
        message: copies["check.error.offline"],
        actions: (
          <ToastAction onClick={() => void retryCheckForUpdates()}>
            {copies["retry"]}
          </ToastAction>
        ),
        dismissButton: true,
      };
    }

    if (update.state === "errored") {
      // TODO: change message to link button
      // On desktop: https://v2.tauri.app/reference/javascript/shell/#open
      // On web use an anchor action
      return {
        type: ToastType.Error,
        message: copies["check.error.online"](
          "https://github.com/thomasvanlankveld/zon/issues/new",
          (update.error as Error).message,
        ),
        actions: (
          <ToastAction onClick={() => void retryCheckForUpdates()}>
            {copies["retry"]}
          </ToastAction>
        ),
        dismissButton: true,
      };
    }

    if (hasDownloaded.state === "errored") {
      return {
        type: ToastType.Error,
        message: copies["download.error"],
        actions: (
          <ToastAction onClick={() => void retryDownloadUpdate()}>
            {copies["retry"]}
          </ToastAction>
        ),
        dismissButton: true,
      };
    }

    if (hasInstalled.state === "errored") {
      return {
        type: ToastType.Error,
        message: copies["install.error"],
        actions: (
          <ToastAction onClick={() => void retryInstallUpdate()}>
            {copies["retry"]}
          </ToastAction>
        ),
        dismissButton: true,
      };
    }

    if (hasRelaunched.state === "errored") {
      return {
        type: ToastType.Error,
        message: copies["relaunch.error"],
        actions: (
          <ToastAction onClick={() => void retryRelaunch()}>
            {copies["retry"]}
          </ToastAction>
        ),
        dismissButton: true,
      };
    }

    if (update.loading) {
      return null;
    }

    if (hasDownloaded.loading) {
      return null;
    }

    if (hasInstalled.loading) {
      return {
        type: ToastType.Info,
        message: copies["install.in-progress"],
      };
    }

    if (hasRelaunched.loading) {
      return {
        type: ToastType.Info,
        message: copies["relaunch.in-progress"],
      };
    }

    if (update() == null) {
      return {
        type: ToastType.Success,
        message: copies["check.no-updates"],
      };
      // console.log(copies["check.no-updates"]);
      // return null;
    }

    if (update()) {
      return {
        type: ToastType.Success,
        message: copies["download.success"],
        actions: (
          <ToastAction onClick={() => setShouldInstall(true)}>
            {copies["install.action"]}
          </ToastAction>
        ),
        autoDismiss: false,
      };
    }

    throw new Error("Invalid updater state");
  }

  return (
    <Show when={toastProps()}>
      {(toastPropsVal) => (
        <Toast closeButton autoDismiss {...toastPropsVal()} />
      )}
    </Show>
  );
}
