import { type Platform } from "@tauri-apps/plugin-os";
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

const MetaContext = createContext();

type MetaProviderProps = {
  meta: Meta;
  children: JSX.Element;
};

export function MetaProvider(props: MetaProviderProps) {
  return (
    // Ignoring lint warning. This value is not meant to be reactive
    // eslint-disable-next-line solid/reactivity
    <MetaContext.Provider value={props.meta}>
      {props.children}
    </MetaContext.Provider>
  );
}

export function useMeta(): Meta {
  return useContext(MetaContext) as Meta;
}
