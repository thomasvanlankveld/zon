import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { createResource, createSignal, Match, Switch } from "solid-js";
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

  return (
    <Toast>
      <Switch>
        <Match when={update.state === "errored"}>
          <p>{copies["check.error"]}</p>
          <Button
            onClick={() => void retryCheckForUpdates()}
            variant="primary"
            size="small"
          >
            {copies["check.retry"]}
          </Button>
          <Button
            onClick={() => void retryCheckForUpdates()}
            variant="secondary"
            size="small"
          >
            {copies["dismiss"]}
          </Button>
        </Match>
        <Match when={hasDownloaded.state === "errored"}>
          <p>{copies["download.error"]}</p>
          <Button onClick={() => void retryDownloadUpdate()}>
            {copies["download.retry"]}
          </Button>
        </Match>
        <Match when={hasInstalled.state === "errored"}>
          <p>{copies["install.error"]}</p>
          <Button onClick={() => void retryInstallUpdate()}>
            {copies["install.retry"]}
          </Button>
        </Match>
        <Match when={hasRelaunched.state === "errored"}>
          <p>{copies["relaunch.error"]}</p>
          <Button onClick={() => void retryRelaunch()}>
            {copies["relaunch.retry"]}
          </Button>
        </Match>
        <Match when={update.loading}>{copies["check.in-progress"]}</Match>
        <Match when={hasDownloaded.loading}>
          {copies["download.in-progress"]}
        </Match>
        <Match when={hasInstalled.loading}>
          {copies["install.in-progress"]}
        </Match>
        <Match when={hasRelaunched.loading}>
          {copies["relaunch.in-progress"]}
        </Match>
        <Match when={update() == null}>{copies["check.no-updates"]}</Match>
        <Match when={update()}>
          <p>{copies["download.success"]}</p>
          <Button onClick={() => setShouldInstall(true)}>
            {copies["install.action"]}
          </Button>
        </Match>
      </Switch>
    </Toast>
  );
}
