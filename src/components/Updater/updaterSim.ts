/**
 * Use this file to simulate the updater plugin.
 *
 * It's mostly intended for use in Updater.tsx, to easily reach UI states that would otherwise be hard to reach.
 *
 * To change the behavior, just change the contents of this file.
 */

// TODO: Maybe add a way to simulate createNavigatorOnline()

import {
  check as tauriCheck,
  Update as TauriUpdate,
} from "@tauri-apps/plugin-updater";
import { relaunch as tauriRelaunch } from "@tauri-apps/plugin-process";

const CHECK_DELAY = 1000;
const DOWNLOAD_DELAY = 1000;
const INSTALL_DELAY = 1000;
const RELAUNCH_DELAY = 1000;

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

let hasCheckFailed = false;
let hasDownloadFailed = false;
let hasInstallFailed = false;
let hasDownloadAndInstallFailed = false;
let hasRelaunchFailed = false;

class Update {
  readonly version: string;
  readonly releaseDate: Date;
  readonly releaseNotes: string;
  readonly available: boolean;
  readonly currentVersion: string;
  readonly rawJson: Record<string, unknown>;
  readonly rid: number;

  constructor() {
    this.version = "1.0.0";
    this.releaseDate = new Date();
    this.releaseNotes = "Initial release";
    this.available = true;
    this.currentVersion = "0.0.0";
    this.rawJson = {};
    this.rid = 0;
  }

  async close(): Promise<void> {
    // No-op in simulation
    return Promise.resolve();
  }

  async download(): Promise<void> {
    console.log("download");
    await delay(DOWNLOAD_DELAY);

    if (!hasDownloadFailed) {
      hasDownloadFailed = true;
      throw new Error("download error");
    }
  }

  async install(): Promise<void> {
    console.log("install");
    await delay(INSTALL_DELAY);

    if (!hasInstallFailed) {
      hasInstallFailed = true;
      throw new Error("install error");
    }
  }

  async downloadAndInstall(): Promise<void> {
    console.log("downloadAndInstall");
    await delay(DOWNLOAD_DELAY);
    await delay(INSTALL_DELAY);

    if (!hasDownloadAndInstallFailed) {
      hasDownloadAndInstallFailed = true;
      throw new Error("downloadAndInstall error");
    }
  }
}

const check: typeof tauriCheck = async function check(options) {
  console.log("check", options);
  await delay(CHECK_DELAY);

  if (!hasCheckFailed) {
    hasCheckFailed = true;
    throw new Error("check error");
  }

  return new Update() as unknown as TauriUpdate | null;
};

const relaunch: typeof tauriRelaunch = async function relaunch() {
  console.log("relaunch");
  await delay(RELAUNCH_DELAY);

  if (!hasRelaunchFailed) {
    hasRelaunchFailed = true;
    throw new Error("relaunch error");
  }
};

export { check, relaunch };
