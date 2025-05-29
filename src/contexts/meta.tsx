import { isTauri } from "@tauri-apps/api/core";
import { platform, type Platform } from "@tauri-apps/plugin-os";
import { createContext, type JSX, useContext } from "solid-js";
import { ValueOf } from "../utils/type";

export const TARGET = {
  WEB: "web",
  DESKTOP: "desktop",
} as const;
export type TARGET = ValueOf<typeof TARGET>;

export type Meta =
  | {
      target: typeof TARGET.WEB;
    }
  | {
      target: typeof TARGET.DESKTOP;
      platform: Platform;
    };

export default function getMeta(): Meta {
  if (!isTauri()) {
    return {
      target: TARGET.WEB,
    };
  }

  return {
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
