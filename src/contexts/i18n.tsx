import { createContext, createSignal, type JSX, useContext } from "solid-js";
import { Translations } from "../translations/types";
import enGB from "../translations/en-GB";

type Locale = "en-GB";

const mapping: Record<Locale, Translations> = {
  "en-GB": enGB,
};

function createI18n() {
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

  function formatNumber(number: number) {
    return new Intl.NumberFormat(locale()).format(number);
  }

  return { t, locale, setLocale, formatNumber };
}

const I18nContext = createContext();

export function I18nProvider(props: { children: JSX.Element }) {
  const i18n = createI18n();

  return (
    <I18nContext.Provider value={i18n}>{props.children}</I18nContext.Provider>
  );
}

type I18n = ReturnType<typeof createI18n>;

export function useI18n(): I18n {
  return useContext(I18nContext) as I18n;
}
