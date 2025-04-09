import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { createResource, createSignal, Show } from "solid-js";
import Toast, { ToastType } from "../Toast/Toast";
import ToastAction from "../Toast/ToastAction";

const copies = {
  "check.in-progress": "Checking for updates...",
  "check.no-updates": "No updates found",
  // TODO: check with `navigator.onLine`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine
  "check.error.offline":
    "To check for updates, restart the app while connected to the internet.",
  "check.error.online": (link: string, message: string) =>
    `Something went wrong while checking for updates. Please submit an issue at "${link}" mentioning the cause "${message}"`,
  "download.in-progress": "Downloading updates...",
  "download.error": "Failed to download the update. Please try again later.",
  "download.success": "Update downloaded",
  "install.in-progress": "Installing updates...",
  "install.error": "Failed to install the update",
  "relaunch.in-progress": "Restarting application...",
  "relaunch.error": "Failed to restart the application",
  "install.action": "Install update",
  dismiss: "Dismiss",
  retry: "Retry",
};

export default function Updater() {
  async function checkForUpdates() {
    return await check();
  }

  const [update, { refetch: retryCheckForUpdates }] =
    createResource(checkForUpdates);

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
    if (update.state === "errored" && navigator.onLine) {
      // TODO: change message to link button
      return {
        type: ToastType.Error,
        message: copies["check.error.online"](
          "https://github.com/thomasvanlankveld/zon/issues/new",
          (update.error as Error).message,
        ),
      };
    }

    if (update.state === "errored" && !navigator.onLine) {
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
      };
    }

    throw new Error("Invalid updater state");
  }

  return (
    <Show when={toastProps()}>
      {(toastPropsVal) => <Toast closeButton {...toastPropsVal()} />}
    </Show>
  );
}
