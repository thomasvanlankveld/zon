import { check } from "@tauri-apps/plugin-updater";
import { createResource, createSignal, Match, Switch } from "solid-js";
import { Portal } from "solid-js/web";
import { useBackgroundState } from "../Background/Background";
import { relaunch } from "@tauri-apps/plugin-process";

const copies = {
  "check.in-progress": "Checking for updates...",
  "check.no-updates": "No updates found",
  "check.error":
    "Unable to check for updates. Please check your internet connection and try again.",
  "download.in-progress": "Downloading updates...",
  "download.error": "Failed to download the update. Please try again later.",
  "install.in-progress": "Installing updates...",
  "install.error": "Failed to install the update. Please try again later.",
  "relaunch.in-progress": "Restarting application...",
  "relaunch.error":
    "Failed to restart the application. Please try again later.",
  noUpdates: "No updates found",
  updatesAvailable: "Updates available!",
  downloading: "Downloading updates...",
  installing: "Installing updates...",
  restart: "Restarting application...",
  "retry.check": "Retry check updates",
  "retry.download": "Retry download update",
  "retry.install": "Retry install update",
  "retry.relaunch": "Retry relaunch application",
  hasDownloaded: "Update downloaded",
  install: "Install update",
};

export default function Updater() {
  const backgroundState = useBackgroundState();

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
    <Portal>
      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          "max-width": "20rem",
          width: "100%",
          // 0.375 gets us the rainbow color at the bottom right corner of the screen
          "--glow-background": backgroundState.getColor(0.375),
          "--glow-opacity": "0.25",
          "--glow-blur": "3rem",
        }}
        class="card text-extra-small glow"
        data-card-size="extra-small"
      >
        <Switch>
          <Match when={update.state === "errored"}>
            <p>{copies["check.error"]}</p>
            <button onClick={() => void retryCheckForUpdates()}>
              {copies["retry.check"]}
            </button>
          </Match>
          <Match when={hasDownloaded.state === "errored"}>
            <p>{copies["download.error"]}</p>
            <button onClick={() => void retryDownloadUpdate()}>
              {copies["retry.download"]}
            </button>
          </Match>
          <Match when={hasInstalled.state === "errored"}>
            <p>{copies["install.error"]}</p>
            <button onClick={() => void retryInstallUpdate()}>
              {copies["retry.install"]}
            </button>
          </Match>
          <Match when={hasRelaunched.state === "errored"}>
            <p>{copies["relaunch.error"]}</p>
            <button onClick={() => void retryRelaunch()}>
              {copies["retry.relaunch"]}
            </button>
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
            <p>{copies.hasDownloaded}</p>
            <button onClick={() => setShouldInstall(true)}>
              {copies.install}
            </button>
          </Match>
        </Switch>
      </div>
    </Portal>
  );
}
