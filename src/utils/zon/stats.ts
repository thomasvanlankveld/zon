import type { CodeStats } from "../tokei.ts";
import type { LINE_TYPE } from "./types.ts";

export function getNumberOfLines(
  stats: CodeStats,
  lineTypes: LINE_TYPE[],
): number {
  return lineTypes.reduce((total, type) => total + stats[type], 0);
}

export function sumStats(statArr: CodeStats[]): CodeStats {
  const sumStat: CodeStats = {
    blanks: 0,
    code: 0,
    comments: 0,
    blobs: {},
  };

  for (const stats of statArr) {
    sumStat.blanks += stats.blanks;
    sumStat.comments += stats.comments;
    sumStat.code += stats.code;
  }

  return sumStat;
}

export function subtractStats(left: CodeStats, right: CodeStats): CodeStats {
  return {
    blanks: left.blanks - right.blanks,
    comments: left.comments - right.comments,
    code: left.code - right.code,
    blobs: {},
  };
}
