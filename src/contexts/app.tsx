import { type JSX } from "solid-js";
import { I18nProvider } from "./i18n";
import { MetaProvider } from "./meta";
import { MouseProvider } from "./mouse";
import { Background } from "../components/Background/Background";

/**
 * This component wraps the app in the necessary providers.
 *
 * @param props.children The child components to wrap
 * @returns The wrapped components
 */
export default function AppProviders(props: { children: JSX.Element }) {
  return (
    <MetaProvider>
      <MouseProvider>
        <Background>
          <I18nProvider>{props.children}</I18nProvider>
        </Background>
      </MouseProvider>
    </MetaProvider>
  );
}
