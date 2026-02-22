// import { type Update } from "@tauri-apps/plugin-updater";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import {
  createContext,
  createResource,
  createSignal,
  Show,
  type JSX,
  type Resource,
  useContext,
} from "solid-js";
import { TARGET, useMeta } from "./meta";
import createNavigatorOnline from "../primitives/createNavigatorOnline";

// // Uncomment this to use a simulator of the updater plugin
// import { check, relaunch } from "../simulators/updaterSim";

/**
 * Update process state and actions.
 *
 * @property {Resource<Update | null | undefined>} update - Result of the update check (available update or null)
 * @property {Resource<boolean>} hasDownloaded - Whether the update has been downloaded
 * @property {Resource<boolean>} hasInstalled - Whether the update has been installed
 * @property {Resource<boolean>} hasRelaunched - Whether the app has been relaunched
 * @property {() => boolean} wasOfflineDuringUpdateCheck - True if the update check failed due to being offline
 * @property {() => boolean} wasOfflineDuringDownload - True if the download failed due to being offline
 * @property {() => boolean} shouldInstallAndRelaunch - True once the user has requested install and restart
 * @property {() => boolean} isPendingRestart - True from "Install and restart" click until process exits (use to guard UI)
 * @property {() => void} requestInstallAndRelaunch - Call when the user confirms install and restart
 * @property {() => void} retryCheckForUpdates - Retry checking for updates
 * @property {() => void} retryDownloadUpdate - Retry downloading the update
 * @property {() => void} retryInstallUpdate - Retry installing the update
 * @property {() => void} retryRelaunch - Retry relaunching the app
 * @property {() => void} startUpdateCheck - Start checking for updates (no-op until called; context is idle by default)
 */
export type UpdateContextValue = {
  update: Resource<Update | null | undefined>;
  hasDownloaded: Resource<boolean>;
  hasInstalled: Resource<boolean>;
  hasRelaunched: Resource<boolean>;
  wasOfflineDuringUpdateCheck: () => boolean;
  wasOfflineDuringDownload: () => boolean;
  shouldInstallAndRelaunch: () => boolean;
  isPendingRestart: () => boolean;
  requestInstallAndRelaunch: () => void;
  startUpdateCheck: () => void;
  retryCheckForUpdates: () => void;
  retryDownloadUpdate: () => void;
  retryInstallUpdate: () => void;
  retryRelaunch: () => void;
};

const UpdateContext = createContext<UpdateContextValue | undefined>(undefined);

type UpdateProviderProps = {
  children: JSX.Element;
};

/**
 * Provide update state and actions for the app update flow.
 *
 * Does nothing by default. On desktop, check/download/install/relaunch run only after something calls
 * startUpdateCheck() (e.g. the Updater component on mount). When not on desktop, provides a no-op value
 * so consumers always have a valid context and never need to branch.
 *
 * @param props.children Child components that will have access to the update context
 */
export function UpdateProvider(props: UpdateProviderProps) {
  const meta = useMeta();

  return (
    <Show
      when={meta.target === TARGET.DESKTOP}
      fallback={<UpdateProviderNoop>{props.children}</UpdateProviderNoop>}
    >
      <UpdateProviderDesktop>{props.children}</UpdateProviderDesktop>
    </Show>
  );
}

/**
 * No-op provider when not on desktop.
 *
 * Provides stub resources (no update, not downloaded/installed/relaunched) and no-op actions so that
 * useUpdateContext() can be used without branching on target.
 */
function UpdateProviderNoop(props: UpdateProviderProps) {
  const [update] = createResource<Update | null | undefined>(() => undefined);
  const [hasDownloaded] = createResource(() => false, {
    initialValue: false,
  });
  const [hasInstalled] = createResource(() => false, {
    initialValue: false,
  });
  const [hasRelaunched] = createResource(() => false, {
    initialValue: false,
  });
  const noop = () => {};
  const value: UpdateContextValue = {
    update,
    hasDownloaded,
    hasInstalled,
    hasRelaunched,
    wasOfflineDuringUpdateCheck: () => false,
    wasOfflineDuringDownload: () => false,
    shouldInstallAndRelaunch: () => false,
    isPendingRestart: () => false,
    requestInstallAndRelaunch: noop,
    startUpdateCheck: noop,
    retryCheckForUpdates: noop,
    retryDownloadUpdate: noop,
    retryInstallUpdate: noop,
    retryRelaunch: noop,
  };
  return (
    <UpdateContext.Provider value={value}>
      {props.children}
    </UpdateContext.Provider>
  );
}

/**
 * Desktop-only provider that runs the real update flow (check, download, install, relaunch).
 * The check runs only when startUpdateCheck() is called; the context is idle by default.
 */
function UpdateProviderDesktop(props: UpdateProviderProps) {
  const meta = useMeta();
  const isOnline = createNavigatorOnline();
  const [shouldCheckForUpdates, setShouldCheckForUpdates] = createSignal(false);
  const [wasOfflineDuringUpdateCheck, setWasOfflineDuringUpdateCheck] =
    createSignal(false);
  const [wasOfflineDuringDownload, setWasOfflineDuringDownload] =
    createSignal(false);
  const [shouldInstallAndRelaunch, setShouldInstallAndRelaunch] =
    createSignal(false);

  // Check for updates (only when shouldCheckForUpdates is true)
  const [update, { refetch: retryCheckForUpdates }] = createResource(
    () => shouldCheckForUpdates(),
    async function checkForUpdates() {
      console.log("Zon app current version", meta.version());
      try {
        return await check();
      } catch (error) {
        setWasOfflineDuringUpdateCheck(!isOnline());
        throw error;
      }
    },
  );

  // Download updates
  const [hasDownloaded, { refetch: retryDownloadUpdate }] = createResource(
    () => update.state !== "errored" && update(),
    async function maybeDownloadUpdates(updateVal: Update | null | undefined) {
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

  // Install updates
  const [hasInstalled, { refetch: retryInstallUpdate }] = createResource(
    () =>
      hasDownloaded.state !== "errored" &&
      hasDownloaded() &&
      shouldInstallAndRelaunch(),
    async function maybeInstallUpdate(hasDownloadedAndShouldInstall: boolean) {
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

  // Relaunch the application
  const [hasRelaunched, { refetch: retryRelaunch }] = createResource(
    () =>
      hasInstalled.state !== "errored" &&
      hasInstalled() &&
      shouldInstallAndRelaunch(),
    async function maybeRelaunch(hasInstalledAndShouldRelaunch: boolean) {
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

  const value: UpdateContextValue = {
    update,
    hasDownloaded,
    hasInstalled,
    hasRelaunched,
    wasOfflineDuringUpdateCheck,
    wasOfflineDuringDownload,
    shouldInstallAndRelaunch,
    isPendingRestart: shouldInstallAndRelaunch,
    requestInstallAndRelaunch: () => setShouldInstallAndRelaunch(true),
    startUpdateCheck: () => setShouldCheckForUpdates(true),
    retryCheckForUpdates: () => void retryCheckForUpdates(),
    retryDownloadUpdate: () => void retryDownloadUpdate(),
    retryInstallUpdate: () => void retryInstallUpdate(),
    retryRelaunch: () => void retryRelaunch(),
  };

  return (
    <UpdateContext.Provider value={value}>
      {props.children}
    </UpdateContext.Provider>
  );
}

/**
 * Get the update context (state and actions for the app update flow).
 *
 * @returns {UpdateContextValue} The update state and actions
 * @example
 * const ctx = useUpdateContext();
 * if (ctx.update()) {
 *   // Update available
 * }
 * if (ctx.isPendingRestart()) {
 *   // Disable actions that might crash during the restart window
 * }
 */
export function useUpdateContext(): UpdateContextValue {
  const context = useContext(UpdateContext);
  if (context === undefined) {
    throw new Error("useUpdateContext must be used within an UpdateProvider");
  }
  return context;
}
