import type { CodeStats } from "../tokei.ts";

type ValueOf<T> = T[keyof T];

export const LINE_TYPE = {
  BLANKS: "blanks",
  CODE: "code",
  COMMENTS: "comments",
} as const;
export type LINE_TYPE = ValueOf<typeof LINE_TYPE>;

export const NODE_TYPE = {
  FILE: "FILE",
  FOLDER: "FOLDER",
  GROUP: Symbol("GROUP"),
} as const;
export type NODE_TYPE = ValueOf<typeof NODE_TYPE>;

export type SegmentName = string | typeof NODE_TYPE.GROUP;
export type Path = SegmentName[];

export type Colors = {
  base: string;
  highlighted: string;
  pressed: string;
};

type NodeBase = {
  stats: CodeStats;
  path: Path;
  name: SegmentName;
  numberOfLines: number;
  firstLine: number;
  colors: Colors;
  depth: number;
};

export type File = NodeBase & {
  type: typeof NODE_TYPE.FILE;
  height: 0;
};

export type Folder = NodeBase & {
  type: typeof NODE_TYPE.FOLDER;
  children: Node[];
  height: number;
};

export type Group = NodeBase & {
  type: typeof NODE_TYPE.GROUP;
  groupedChildren: Node[];
  height: number;
};

export type Node = File | Folder | Group;
