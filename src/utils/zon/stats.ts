import type { LINE_TYPE, LineTypeCounts } from "./types.ts";

export function getNumberOfLines(
  lineTypeCounts: LineTypeCounts,
  lineTypes: LINE_TYPE[],
): number {
  return lineTypes.reduce((total, type) => total + lineTypeCounts[type], 0);
}

export function sumLineTypeCounts(countsArr: LineTypeCounts[]): LineTypeCounts {
  const sums: LineTypeCounts = {
    blanks: 0,
    code: 0,
    comments: 0,
  };

  for (const lineTypeCounts of countsArr) {
    sums.blanks += lineTypeCounts.blanks;
    sums.comments += lineTypeCounts.comments;
    sums.code += lineTypeCounts.code;
  }

  return sums;
}

export function subtractLineTypeCounts(
  left: LineTypeCounts,
  right: LineTypeCounts,
): LineTypeCounts {
  return {
    blanks: left.blanks - right.blanks,
    comments: left.comments - right.comments,
    code: left.code - right.code,
  };
}
