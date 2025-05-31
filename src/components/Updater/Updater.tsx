import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { createResource, createSignal, Show } from "solid-js";
import { TARGET, useMeta } from "../../contexts/meta";
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
  // `Failed to check for updates, please submit an issue at "${link}" mentioning the cause "${message}"`,
  "download.in-progress": "Downloading updates...",
  "download.error": "Failed to download the update. Please try again later.",
  "download.success": "Update downloaded",
  "install.in-progress": "Installing updates...",
  "install.error": "Failed to install the update",
  "install.success": "Update installed",
  "relaunch.in-progress": "Restarting application...",
  "relaunch.error": "Failed to restart the application",
  "install.action": "Install and restart",
  "relaunch.action": "Restart now",
  dismiss: "Dismiss",
  retry: "Retry",
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

  const [hasDownloaded, { refetch: retryDownloadUpdate }] = createResource(
    () => update.state !== "errored" && update(),
    async function maybeDownloadUpdates(updateVal) {
      if (typeof updateVal !== "object" || updateVal == null) {
        return false;
      }

      i++;
      if (i === 3) {
        throw new Error("test download");
      }

      await updateVal.download();
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
      return {
        type: ToastType.Warning,
        message: copies["check.error.offline"],
        actions: (
          <ToastAction
            onClick={toastCallback(() => void retryCheckForUpdates())}
          >
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
          <ToastAction
            onClick={toastCallback(() => void retryCheckForUpdates())}
          >
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
          <ToastAction
            onClick={toastCallback(() => void retryDownloadUpdate())}
          >
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
          <ToastAction onClick={toastCallback(() => void retryInstallUpdate())}>
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
          <ToastAction onClick={toastCallback(() => void retryRelaunch())}>
            {copies["retry"]}
          </ToastAction>
        ),
        dismissButton: true,
      };
    }

    if (hasUserClickedToastAction() && update.loading) {
      return {
        type: ToastType.Info,
        message: copies["check.in-progress"],
        autoDismiss: false,
      };
    }

    if (hasUserClickedToastAction() && hasDownloaded.loading) {
      return {
        type: ToastType.Info,
        message: copies["download.in-progress"],
        autoDismiss: false,
      };
    }

    if (hasUserClickedToastAction() && hasInstalled.loading) {
      return {
        type: ToastType.Info,
        message: copies["install.in-progress"],
        autoDismiss: false,
      };
    }

    if (hasUserClickedToastAction() && hasRelaunched.loading) {
      return {
        type: ToastType.Info,
        message: copies["relaunch.in-progress"],
        autoDismiss: false,
      };
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
