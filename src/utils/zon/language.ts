import { LanguageType } from "../tokei";
import { addChildColorValue, createCounted, subtractChild } from "./counted";
import { LanguageCounts } from "./types";

export function sumLanguageCounts(countsArr: LanguageCounts[]): LanguageCounts {
  const sums: LanguageCounts = {};

  for (const LanguageCounts of countsArr) {
    for (const [languageName, count] of Object.entries(LanguageCounts)) {
      const languageSum =
        sums[languageName as LanguageType] ?? createCounted(0);

      languageSum.numberOfLines += count.numberOfLines;
      addChildColorValue(languageSum, count);

      if (!((languageName as LanguageType) in sums)) {
        sums[languageName as LanguageType] = languageSum;
      }
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
    }
  }

  return sums;
}
