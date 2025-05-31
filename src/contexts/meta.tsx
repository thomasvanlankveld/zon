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

export default function getMeta(): Meta {
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

export function MetaProvider(props: MetaProviderProps) {
  const meta = getMeta();

  return (
    // Ignoring lint warning. This value is not meant to be reactive
    <MetaContext.Provider value={meta}>{props.children}</MetaContext.Provider>
  );
}

export function useMeta(): Meta {
  return useContext(MetaContext) as Meta;
}
