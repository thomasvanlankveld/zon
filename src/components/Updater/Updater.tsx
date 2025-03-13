import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { createResource, Show, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { useBackgroundState } from "../Background/Background";

type UpdateError = {
  type: "check" | "download" | "install";
  error: Error;
};

export default function Updater() {
  const backgroundState = useBackgroundState();
  const [isVisible, setIsVisible] = createSignal(true);
  const [error, setError] = createSignal<UpdateError | null>(null);

  async function checkForUpdates() {
    try {
      setError(null);
      return await check();
    } catch (err) {
      setError({
        type: "check",
        error: err instanceof Error ? err : new Error(String(err)),
      });
      return null;
    }
  }

  const [update, { refetch }] = createResource(checkForUpdates);

  const [hasDownload] = createResource(update, async (updateVal) => {
    if (updateVal != null) {
      try {
        await updateVal.download();
        return true;
      } catch (err) {
        setError({
          type: "download",
          error: err instanceof Error ? err : new Error(String(err)),
        });
        return false;
      }
    }
    return false;
  });

  async function installUpdate() {
    const updateVal = update();
    const hasDownloadVal = hasDownload();

    if (updateVal == null || !hasDownloadVal) {
      throw new Error("No update to install");
    }

    try {
      await updateVal.install();
      await relaunch();
    } catch (err) {
      setError({
        type: "install",
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  function getErrorMessage(error: UpdateError) {
    switch (error.type) {
      case "check":
        return "Unable to check for updates. Please check your internet connection and try again.";
      case "download":
        return "Failed to download the update. Please try again later.";
      case "install":
        return "Failed to install the update. Please try again.";
    }
  }

  return (
    <Show when={isVisible()}>
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
          class="card glow"
          data-card-size="extra-small"
        >
          <button
            onClick={() => setIsVisible(false)}
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              color: "var(--text-secondary, #666)",
              cursor: "pointer",
              border: "none",
              background: "none",
              padding: "4px",
              "font-size": "1.25rem",
            }}
            aria-label="Close"
          >
            ×
          </button>

          <div style={{ "padding-right": "1.5rem" }}>
            <Show
              when={!error()}
              fallback={
                <div>
                  <span
                    style={{
                      color: "var(--text-error, #dc2626)",
                      display: "block",
                      "margin-bottom": "0.5rem",
                    }}
                  >
                    {getErrorMessage(error()!)}
                  </span>
                  <button
                    onClick={() => void refetch()}
                    style={{
                      background: "var(--primary-color, #0066cc)",
                      color: "white",
                      padding: "0.5rem 1rem",
                      "border-radius": "4px",
                      border: "none",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--primary-color-dark, #0052a3)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "var(--primary-color, #0066cc)")
                    }
                  >
                    Retry
                  </button>
                </div>
              }
            >
              <Show
                when={!update.loading}
                fallback={
                  <div style={{ display: "flex", "align-items": "center" }}>
                    <div
                      style={{
                        "margin-right": "0.5rem",
                        width: "1rem",
                        height: "1rem",
                        border: "2px solid var(--primary-color, #0066cc)",
                        "border-top-color": "transparent",
                        "border-radius": "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <span>Checking for updates...</span>
                  </div>
                }
              >
                <Show
                  when={update() && !hasDownload.loading}
                  fallback={
                    hasDownload.loading ? (
                      <div style={{ display: "flex", "align-items": "center" }}>
                        <div
                          style={{
                            "margin-right": "0.5rem",
                            width: "1rem",
                            height: "1rem",
                            border: "2px solid var(--primary-color, #0066cc)",
                            "border-top-color": "transparent",
                            "border-radius": "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        <span>Downloading update...</span>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-secondary, #666)" }}>
                        You're up to date!
                      </span>
                    )
                  }
                >
                  <Show when={hasDownload()}>
                    <div>
                      <p style={{ "margin-bottom": "0.5rem" }}>
                        Update ready to install!
                      </p>
                      <button
                        onClick={() => void installUpdate()}
                        style={{
                          background: "var(--primary-color, #0066cc)",
                          color: "white",
                          padding: "0.5rem 1rem",
                          "border-radius": "4px",
                          border: "none",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--primary-color-dark, #0052a3)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "var(--primary-color, #0066cc)")
                        }
                      >
                        Install version {update()?.version} and restart
                      </button>
                    </div>
                  </Show>
                </Show>
              </Show>
            </Show>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
