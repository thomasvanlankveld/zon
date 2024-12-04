type TranslationFunction = (args: Record<string, string>) => string;

export type Translations = {
  [key: string]: string | TranslationFunction;
};
