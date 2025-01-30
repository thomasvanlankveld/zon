import { LanguageType } from "../tokei.ts";
import { ValueOf } from "../type.ts";

export const LINE_TYPE = {
  CODE: "code",
  COMMENTS: "comments",
  BLANKS: "blanks",
} as const;
export type LINE_TYPE = ValueOf<typeof LINE_TYPE>;

export const GROUP_SEGMENT = Symbol("GROUP");
export type GROUP_SEGMENT = typeof GROUP_SEGMENT;

export const NODE_TYPE = {
  FILE: "FILE",
  FOLDER: "FOLDER",
  GROUP: GROUP_SEGMENT,
} as const;
export type NODE_TYPE = ValueOf<typeof NODE_TYPE>;

export type SegmentName = string | typeof GROUP_SEGMENT;
export type Path = SegmentName[];

export type Colors = {
  regular: string;
  slightHighlight?: string;
  highlight: string;
  press: string;
  opposite?: string;
  deemphasize: string;
};

export type Counted = {
  numberOfLines: number;
  colorValue: number;
};

export type LineTypeCounts = {
  [LINE_TYPE.CODE]: Counted;
  [LINE_TYPE.COMMENTS]: Counted;
  [LINE_TYPE.BLANKS]: Counted;
};

export type LanguageCounts = Partial<Record<LanguageType, Counted>>;

type NodeBase = Counted & {
  lineTypes: LineTypeCounts;
  languages: LanguageCounts;
  path: Path;
  name: SegmentName;
  firstLine: number;
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

export function isFile(node: Node): node is File {
  return node.type === NODE_TYPE.FILE;
}

export function isFolder(node: Node): node is Folder {
  return node.type === NODE_TYPE.FOLDER;
}

export function isGroup(node: Node): node is Group {
  return node.type === NODE_TYPE.GROUP;
}
