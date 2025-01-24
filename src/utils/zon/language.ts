import { LanguageType } from "../tokei";
import { LanguageCounts } from "./types";

/**
 * Add a given of number of lines to a set of language counts. Adds a new entry for the language if it didn't exist yet,
 * and removes entries when the new total is 0. This function modifies the given `languageCounts` object.
 */
export function addLanguageCount(
  languageCounts: LanguageCounts,
  languageName: LanguageType,
  numberOfLines: number,
): void {
  const oldNumberOfLines = languageCounts[languageName] ?? 0;
  const newNumberOfLines = oldNumberOfLines + numberOfLines;

  if (newNumberOfLines === 0) {
    delete languageCounts[languageName];
  } else {
    languageCounts[languageName] = newNumberOfLines;
  }
}

export function sumLanguageCounts(countsArr: LanguageCounts[]): LanguageCounts {
  const sums: LanguageCounts = {};

  for (const LanguageCounts of countsArr) {
    for (const [languageName, count] of Object.entries(LanguageCounts)) {
      addLanguageCount(sums, languageName as LanguageType, count);
    }
  }

  return sums;
}

export function subtractLanguageCounts(
  left: LanguageCounts,
  right: LanguageCounts,
): LanguageCounts {
  const leftCopy = { ...left };

  for (const [languageName, count] of Object.entries(right)) {
    addLanguageCount(leftCopy, languageName as LanguageType, -count);
  }

  return leftCopy;
}
