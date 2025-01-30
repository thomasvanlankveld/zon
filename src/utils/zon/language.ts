import { LanguageType } from "../tokei";
import { addChildColorValue, createCounted, subtractChild } from "./counted";
import { LanguageCounts } from "./types";

/**
 * Add the given number of lines to a language sum. Creates a new entry if needed.
 */
export function addLanguageCount(
  sums: LanguageCounts,
  languageName: LanguageType,
  numberOfLines: number,
): void {
  const languageSum = sums[languageName] ?? createCounted(0);

  languageSum.numberOfLines += numberOfLines;

  if (!(languageName in sums)) {
    sums[languageName] = languageSum;
  }
}

export function sumLanguageCounts(countsArr: LanguageCounts[]): LanguageCounts {
  const sums: LanguageCounts = {};

  for (const LanguageCounts of countsArr) {
    for (const [languageName, count] of Object.entries(LanguageCounts)) {
      addLanguageCount(sums, languageName as LanguageType, count.numberOfLines);
    }
  }

  // Second pass, because we need the total number of lines per language before we can determine its color value.
  for (const LanguageCounts of countsArr) {
    for (const [languageName, count] of Object.entries(LanguageCounts)) {
      const languageSum = sums[languageName as LanguageType];

      if (languageSum == null) {
        throw new Error(
          "Can't determine color value of non-existing language sum",
        );
      }

      addChildColorValue(languageSum, count);
    }
  }

  return sums;
}

export function subtractLanguageCounts(
  totals: LanguageCounts,
  toSubtract: LanguageCounts,
): LanguageCounts {
  const sums: LanguageCounts = { ...totals };

  for (const [languageName, count] of Object.entries(toSubtract)) {
    const oldSum = totals[languageName as LanguageType] ?? createCounted(0);
    const newSum = subtractChild(oldSum, count);

    if (newSum.numberOfLines > 0) {
      sums[languageName as LanguageType] = newSum;
    } else {
      delete sums[languageName as LanguageType];
    }
  }

  return sums;
}
