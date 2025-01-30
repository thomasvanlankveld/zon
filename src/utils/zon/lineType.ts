import { CodeStats } from "../tokei.ts";
import { subtractChild, sumCounted } from "./counted.ts";
import type { LINE_TYPE, LineTypeCounts } from "./types.ts";

/**
 * Get the total number of lines, of the given set of line types, from a Tokei stats object.
 */
export function getNumberOfLines(
  lineTypeCounts: CodeStats,
  lineTypes: LINE_TYPE[],
): number {
  return lineTypes.reduce((total, type) => total + lineTypeCounts[type], 0);
}

/**
 * Per line type, sum all counts of that type
 */
export function sumLineTypeCounts(countsArr: LineTypeCounts[]): LineTypeCounts {
  return {
    blanks: sumCounted(countsArr.map((count) => count.blanks)),
    code: sumCounted(countsArr.map((count) => count.code)),
    comments: sumCounted(countsArr.map((count) => count.comments)),
  };
}

/**
 * Resulting number of lines and color value per line type, after removing a child from its parent
 * @param fallbackColorValue Color value to use when the resulting number of lines for a line type is 0
 */
export function subtractLineTypeCounts(
  left: LineTypeCounts,
  right: LineTypeCounts,
  fallbackColorValue: number,
): LineTypeCounts {
  return {
    blanks: subtractChild(left.blanks, right.blanks, fallbackColorValue),
    comments: subtractChild(left.comments, right.comments, fallbackColorValue),
    code: subtractChild(left.code, right.code, fallbackColorValue),
  };
}
