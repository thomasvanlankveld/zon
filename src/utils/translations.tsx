import { createContext, createSignal, type JSX, useContext } from "solid-js";
import { Translations } from "../translations/types";
import enGB from "../translations/en-GB";

type Locale = "en-GB";

const mapping: Record<Locale, Translations> = {
  "en-GB": enGB,
};

function createInternationalization() {
  const [locale, setLocale] = createSignal<Locale>("en-GB");

  function t(key: string, args?: Record<string, string>) {
    const dictionary = mapping[locale()];
    const entry = dictionary[key];

    if (entry == null) {
      throw new Error(`Translation for ${key} not found`);
    }

    if (typeof entry === "function") {
      return entry(args ?? {});
    }

    return entry;
  }

  return { t, locale, setLocale };
}

const TranslationsContext = createContext();

export function TranslationsProvider(props: { children: JSX.Element }) {
  const internationalization = createInternationalization();

  return (
    <TranslationsContext.Provider value={internationalization}>
      {props.children}
    </TranslationsContext.Provider>
  );
}

type Internationalization = ReturnType<typeof createInternationalization>;

export function useTranslations(): Internationalization {
  return useContext(TranslationsContext) as Internationalization;
}
