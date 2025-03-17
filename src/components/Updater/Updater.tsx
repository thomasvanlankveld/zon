import { check } from "@tauri-apps/plugin-updater";
import { createResource, Match, Switch } from "solid-js";
import { Portal } from "solid-js/web";
import { useBackgroundState } from "../Background/Background";

const copies = {
  loading: "Checking for updates...",
  error:
    "Unable to check for updates. Please check your internet connection and try again.",
  noUpdates: "No updates found",
  updatesAvailable: "Updates available!",
  downloading: "Downloading updates...",
  installing: "Installing updates...",
  restart: "Restarting application...",
  retry: "Retry check updates",
};

export default function Updater() {
  const backgroundState = useBackgroundState();

  async function checkForUpdates() {
    return await check();
  }

  const [update, { refetch: retryCheckForUpdates }] =
    createResource(checkForUpdates);

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
            <p>{copies.error}</p>
            <button onClick={() => void retryCheckForUpdates()}>
              {copies.retry}
            </button>
          </Match>
          <Match when={update.loading}>{copies.loading}</Match>
          <Match when={update()}>{copies.updatesAvailable}</Match>
        </Switch>
      </div>
    </Portal>
  );
}
