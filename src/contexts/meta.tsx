import { getVersion } from "@tauri-apps/api/app";
import { isTauri } from "@tauri-apps/api/core";
import { platform, type Platform } from "@tauri-apps/plugin-os";
import {
  createContext,
  createResource,
  type JSX,
  Resource,
  useContext,
} from "solid-js";
import { ValueOf } from "../utils/type";

export const TARGET = {
  WEB: "web",
  DESKTOP: "desktop",
} as const;
export type TARGET = ValueOf<typeof TARGET>;

/**
 * Meta information about the current environment.
 *
 * @property {Resource<string>} version - The version of the application
 * @property {TARGET} target - The target of the application: `web` or `desktop`
 * @property {Platform} [platform] - The platform of the application (only available on desktop): `windows`, `macos`, `linux`, etc.
 */
export type Meta = {
  version: Resource<string>;
} & (
  | {
      target: typeof TARGET.WEB;
    }
  | {
      target: typeof TARGET.DESKTOP;
      platform: Platform;
    }
);

/**
 * Ask Tauri for meta information about the current environment.
 *
 * @returns {Meta} The meta information
 */
function getMeta(): Meta {
  const [version] = createResource(getVersion);

  if (!isTauri()) {
    return {
      version,
      target: TARGET.WEB,
    };
  }

  return {
    version,
    target: TARGET.DESKTOP,
    platform: platform(),
  };
}

const MetaContext = createContext();

type MetaProviderProps = {
  children: JSX.Element;
};

/**
 * Provide meta information about the current environment.
 */
export function MetaProvider(props: MetaProviderProps) {
  const meta = getMeta();

  return (
    <MetaContext.Provider value={meta}>{props.children}</MetaContext.Provider>
  );
}

/**
 * Get information about the current environment.
 *
 * @returns {Meta} The meta information
 */
export function useMeta(): Meta {
  return useContext(MetaContext) as Meta;
}
