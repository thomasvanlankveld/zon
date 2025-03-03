import { createContext, type JSX, useContext } from "solid-js";
import { ValueOf } from "../utils/type";

export const TARGET = {
  WEB: "web",
  DESKTOP: "desktop",
} as const;
export type TARGET = ValueOf<typeof TARGET>;

const TargetContext = createContext();

type TargetProviderProps = {
  target: TARGET;
  children: JSX.Element;
};

export function TargetProvider(props: TargetProviderProps) {
  return (
    // Ignoring lint warning. This value is not meant to be reactive
    // eslint-disable-next-line solid/reactivity
    <TargetContext.Provider value={props.target}>
      {props.children}
    </TargetContext.Provider>
  );
}

export function useTarget(): TARGET {
  return useContext(TargetContext) as TARGET;
}
