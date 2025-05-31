import enGBTranslations from "./en-GB";

// Extract the type of the english translations object
type Translations = typeof enGBTranslations;

// Extract all possible translation keys
type TranslationKey = keyof Translations;

// Extract the type of arguments for each translation key
type TranslationArgs = {
  [K in TranslationKey]: Translations[K] extends (args: infer A) => string
    ? A
    : never;
};

// Helper type to get the return type of a translation
type TranslationValue<K extends TranslationKey> = Translations[K] extends (
  args: TranslationArgs[K],
) => string
  ? (args: TranslationArgs[K]) => string
  : string;

export type { Translations, TranslationKey, TranslationArgs, TranslationValue };
