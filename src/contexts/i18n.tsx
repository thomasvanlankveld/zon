import { createContext, createSignal, type JSX, useContext } from "solid-js";
import enGB from "../translations/en-GB";
import {
  Translations,
  TranslationKey,
  TranslationArgs,
} from "../translations/types";

type Locale = "en-GB";

const mapping: Record<Locale, Translations> = {
  "en-GB": enGB,
};

/**
 * Create the internationalization services.
 *
 * Static types use the `en-GB` locale as a base.
 *
 * @returns {I18n} The internationalization services
 */
function createI18n() {
  const [locale, setLocale] = createSignal<Locale>("en-GB");

  /**
   * Translate a string.
   *
   * @param {TranslationKey} key - The key of the string to translate
   * @param {TranslationArgs[K]} [args] - The arguments to pass to the translation function
   * @returns {string} The translated string
   */
  function t<K extends TranslationKey>(
    key: K,
    args?: TranslationArgs[K],
  ): string {
    const dictionary = mapping[locale()];
    const entry = dictionary[key];

    if (entry == null) {
      throw new Error(`Translation for ${key} not found`);
    }

    if (typeof entry === "function") {
      if (args == null) {
        throw new Error(`Translation ${key} requires arguments`);
      }
      return (entry as (args: TranslationArgs[K]) => string)(args);
    }

    if (args != null) {
      throw new Error(`Translation ${key} does not accept arguments`);
    }

    return entry;
  }

  /**
   * Format a number.
   *
   * @param {number} number - The number to format
   * @returns {string} The formatted number
   */
  function formatNumber(number: number) {
    return new Intl.NumberFormat(locale()).format(number);
  }

  return { t, locale, setLocale, formatNumber };
}

const I18nContext = createContext();

/**
 * Provide internationalization services.
 */
export function I18nProvider(props: { children: JSX.Element }) {
  const i18n = createI18n();

  return (
    <I18nContext.Provider value={i18n}>{props.children}</I18nContext.Provider>
  );
}

/**
 * Internationalization services.
 *
 * @property {(key: TranslationKey, args?: TranslationArgs[K]) => string} t - Translate a string
 * @property {() => string} locale - Get the current locale
 * @property {(locale: Locale) => void} setLocale - Set the current locale
 * @property {(number: number) => string} formatNumber - Format a number
 */
type I18n = ReturnType<typeof createI18n>;

/**
 * Get the internationalization services.
 *
 * @returns {I18n} The internationalization services
 */
export function useI18n(): I18n {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context as I18n;
}
