import { CodeStats } from "../tokei.ts";
import { subtractChild, sumCounted } from "./counted.ts";
import type { LINE_TYPE, LineTypeCounts } from "./types.ts";

export function getNumberOfLines(
  lineTypeCounts: CodeStats,
  lineTypes: LINE_TYPE[],
): number {
  return lineTypes.reduce((total, type) => total + lineTypeCounts[type], 0);
}

export function sumLineTypeCounts(countsArr: LineTypeCounts[]): LineTypeCounts {
  return {
    blanks: sumCounted(countsArr.map((count) => count.blanks)),
    code: sumCounted(countsArr.map((count) => count.code)),
    comments: sumCounted(countsArr.map((count) => count.comments)),
  };
}

export function subtractLineTypeCounts(
  left: LineTypeCounts,
  right: LineTypeCounts,
): LineTypeCounts {
  return {
    blanks: subtractChild(left.blanks, right.blanks),
    comments: subtractChild(left.comments, right.comments),
    code: subtractChild(left.code, right.code),
  };
}
