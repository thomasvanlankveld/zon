import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { createResource, createSignal } from "solid-js";
import Button from "../Button/Button";
import Toast from "../Toast/Toast";

const copies = {
  "check.in-progress": "Checking for updates...",
  "check.no-updates": "No updates found",
  "check.error":
    "Unable to find updates. Please check your internet connection and try again.",
  "check.retry": "Retry check for updates",
  "download.in-progress": "Downloading updates...",
  "download.error": "Failed to download the update. Please try again later.",
  "download.retry": "Retry download update",
  "download.success": "Update downloaded",
  "install.in-progress": "Installing updates...",
  "install.error": "Failed to install the update. Please try again later.",
  "install.retry": "Retry install update",
  "relaunch.in-progress": "Restarting application...",
  "relaunch.error":
    "Failed to restart the application. Please try again later.",
  "relaunch.retry": "Retry relaunch application",
  "install.action": "Install update",
  dismiss: "Dismiss",
};

export default function Updater() {
  async function checkForUpdates() {
    return await check();
  }

  const [update, { refetch: retryCheckForUpdates }] =
    createResource(checkForUpdates);

  const [hasDownloaded, { refetch: retryDownloadUpdate }] = createResource(
    () => update.state !== "errored" && update(),
    async (updateVal) => {
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
    async (shouldInstallVal) => {
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
    async (hasInstalledVal) => {
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

  const toastContent = () => {
    if (update.state === "errored") {
      return (
        <>
          <p>{copies["check.error"]}</p>
          <Button onClick={() => void retryCheckForUpdates()}>
            {copies["check.retry"]}
          </Button>
          <Button
            onClick={() => void retryCheckForUpdates()}
            variant="secondary"
            size="small"
          >
            {copies["dismiss"]}
          </Button>
        </>
      );
    }
    if (hasDownloaded.state === "errored") {
      return (
        <>
          <p>{copies["download.error"]}</p>
          <Button onClick={() => void retryDownloadUpdate()}>
            {copies["download.retry"]}
          </Button>
        </>
      );
    }
    if (hasInstalled.state === "errored") {
      return (
        <>
          <p>{copies["install.error"]}</p>
          <Button onClick={() => void retryInstallUpdate()}>
            {copies["install.retry"]}
          </Button>
        </>
      );
    }
    if (hasRelaunched.state === "errored") {
      return (
        <>
          <p>{copies["relaunch.error"]}</p>
          <Button onClick={() => void retryRelaunch()}>
            {copies["relaunch.retry"]}
          </Button>
        </>
      );
    }
    if (update.loading) {
      return <p>{copies["check.in-progress"]}</p>;
    }
    if (hasDownloaded.loading) {
      return <p>{copies["download.in-progress"]}</p>;
    }
    if (hasInstalled.loading) {
      return <p>{copies["install.in-progress"]}</p>;
    }
    if (hasRelaunched.loading) {
      return <p>{copies["relaunch.in-progress"]}</p>;
    }
    if (update() == null) {
      return <p>{copies["check.no-updates"]}</p>;
    }
    if (update()) {
      return (
        <>
          <p>{copies["download.success"]}</p>
          <Button onClick={() => setShouldInstall(true)}>
            {copies["install.action"]}
          </Button>
        </>
      );
    }
  };

  return <Toast>{toastContent()}</Toast>;
}
