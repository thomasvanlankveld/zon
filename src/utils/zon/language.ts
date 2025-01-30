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

/**
 * Per language, sum up all counts of that language, and deduce the sum's color value
 */
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

/**
 * Resulting number of lines and color value per language, after removing a child from its parent
 * @param fallbackColorValue Color value to use when the resulting number of lines for a line type is 0
 */
export function subtractLanguageCounts(
  parent: LanguageCounts,
  child: LanguageCounts,
): LanguageCounts {
  const sums: LanguageCounts = { ...parent };

  for (const [languageName, count] of Object.entries(child)) {
    const oldSum = parent[languageName as LanguageType] ?? createCounted(0);
    const newSum = subtractChild(oldSum, count);

    if (newSum.numberOfLines > 0) {
      sums[languageName as LanguageType] = newSum;
    } else {
      delete sums[languageName as LanguageType];
    }
  }

  return sums;
}
