import { rainbow } from "./color.ts";
import { CodeStats, Languages } from "./tokei.ts";

export const LineType = {
  blanks: "blanks",
  code: "code",
  comments: "comments",
} as const;
export type LineType = keyof typeof LineType;

export const NODE_TYPE = {
  FILE: "FILE",
  FOLDER: "FOLDER",
  // TODO: Rename summary to something like "SMALLER_ITEMS"
  SUMMARY: "SUMMARY",
} as const;
export type NODE_TYPE = keyof typeof NODE_TYPE;

// type File = {
//   type: typeof NODE_TYPE.FILE;
//   name: string;
//   height: 0;
// };

// type Folder = {
//   type: typeof NODE_TYPE.FOLDER;
//   name: string;
//   children: Node[];
//   height: number;
// };

// type Summary = {
//   type: typeof NODE_TYPE.SUMMARY;
//   height: number;
// };

// export type Node = {
//   stats: CodeStats;
//   path: string;
//   numberOfLines: number;
//   firstLine: number;
//   color: string;
//   depth: number;
// } & (File | Folder | Summary);

export type Node = {
  type: NODE_TYPE;
  stats: CodeStats;
  path: string;
  name: string;
  numberOfLines: number;
  firstLine: number;
  color: string;
  depth: number;
  height: number;
  children: Node[];
};

export function getProjectName(projectPath: string): string {
  const projectPathSegments = projectPath.split("/");

  return projectPathSegments[projectPathSegments.length - 1];
}

export function createTree(
  projectPath: string,
  languages: Languages,
  lineTypes: LineType[],
) {
  const projectName = getProjectName(projectPath);
  const numberOfCharactersToRemove = projectPath.length - projectName.length;

  // Folders can have files in multiple languages, so ignoring those for now
  const languageValues = Object.values(languages);

  const nodes: { [name: string]: Node } = {};

  // For every programming language
  for (const language of languageValues) {
    // For every file
    for (const tokeiReport of language.reports) {
      const filePath = tokeiReport.name.slice(numberOfCharactersToRemove);
      const filePathSegments = filePath.split("/");

      // Create or update all parent folders, then create the file
      for (let i = 0; i < filePathSegments.length; i++) {
        const nodePath = filePathSegments.slice(0, i + 1).join("/");

        if (nodePath in nodes) {
          const node = nodes[nodePath];
          node.stats.blanks += tokeiReport.stats.blanks;
          node.stats.code += tokeiReport.stats.code;
          node.stats.comments += tokeiReport.stats.comments;
          node.numberOfLines += getNumberOfLines(tokeiReport.stats, lineTypes);
          node.height = Math.max(node.height, filePathSegments.length - i - 1);
        } else {
          const type =
            i === filePathSegments.length - 1
              ? NODE_TYPE.FILE
              : NODE_TYPE.FOLDER;

          // TODO: Maybe use `createNode`?
          const node = {
            type,
            stats: tokeiReport.stats,
            path: nodePath,
            name: filePathSegments[i],
            numberOfLines: getNumberOfLines(tokeiReport.stats, lineTypes),
            depth: i,
            height: filePathSegments.length - i - 1,
            // `children` updated as we build the tree
            children: [],
            // Actual values of `firstLine` and `color` can only be determined after sorting
            firstLine: 0,
            color: "",
          };

          nodes[nodePath] = node;

          if (i > 0) {
            const parentName = filePathSegments.slice(0, i).join("/");
            const parent = nodes[parentName];

            parent.children.push(node);
          }
        }
      }
    }
  }

  const root = nodes[projectName];

  sortTree(root);
  addDeduced(root, root.numberOfLines, 0);

  return root;
}

function getNumberOfLines(stats: CodeStats, lineTypes: LineType[]): number {
  return lineTypes.reduce((total, type) => total + stats[type], 0);
}

function sortTree(node: Node): void {
  node.children.sort((left, right) =>
    left.numberOfLines < right.numberOfLines ? 1 : -1,
  );

  for (const child of node.children) {
    sortTree(child);
  }
}

function addDeduced(
  node: Node,
  totalNumberOfLines: number,
  lineNumber: number,
): void {
  for (const child of node.children) {
    child.firstLine = lineNumber;

    const middleLine = lineNumber + child.numberOfLines / 2;
    child.color = rainbow(middleLine / totalNumberOfLines);

    addDeduced(child, totalNumberOfLines, lineNumber);

    lineNumber += child.numberOfLines;
  }
}

function sumStats(statArr: CodeStats[]): CodeStats {
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

function subtractStats(left: CodeStats, right: CodeStats): CodeStats {
  return {
    blanks: left.blanks - right.blanks,
    comments: left.comments - right.comments,
    code: left.code - right.code,
    blobs: {},
  };
}

// TODO: Move grouping into a tree manipulation function, to maintain consistency between different UI elements?
type GetDescendantsOptions = {
  // TODO: Maybe make `exclude` into a callback?
  exclude?: {
    minLines?: number;
    maxDepth?: number;
  };
  group?: {
    // TODO: Maybe replace `group.minLines` with a callback?
    minLines?: number;
    // TODO: Maybe we don't need maxChildren?
    maxChildren?: number;
  };
};

export function getDescendants(
  node: Node,
  options: GetDescendantsOptions = {},
): Node[] {
  const excludeMinLines = options.exclude?.minLines ?? 0;
  const excludeMaxDepth = options.exclude?.maxDepth ?? Infinity;

  if (node.numberOfLines < excludeMinLines) {
    return [];
  }

  if (node.depth === excludeMaxDepth) {
    return [node];
  }

  const groupMinLines = options.group?.minLines ?? 0;
  const groupMaxChildren = options.group?.maxChildren ?? Infinity;

  const visibleChildren = node.children
    .slice(0, groupMaxChildren)
    // TODO: Instead of filter, partition?
    .filter((child) => child.numberOfLines >= groupMinLines);

  const childDescendants = visibleChildren.flatMap((child) =>
    getDescendants(child, options),
  );

  const nodes = [node, ...childDescendants];

  if (node.children.length > visibleChildren.length) {
    // The number of hidden nodes may be much larger than the number of visible ones, so we calculate the hidden stats
    // by subtracting the visible totals from the parent's total
    const visibleStats = sumStats(visibleChildren.map((child) => child.stats));
    const hiddenStats = subtractStats(node.stats, visibleStats);

    const lastVisibleChild = visibleChildren.at(-1);
    const firstHiddenLine =
      lastVisibleChild != null
        ? lastVisibleChild.firstLine + lastVisibleChild.numberOfLines
        : node.firstLine;

    const hiddenNumberOfLines =
      node.numberOfLines -
      visibleChildren.reduce((acc, child) => acc + child.numberOfLines, 0);

    const summary: Node = {
      type: NODE_TYPE.SUMMARY,
      stats: hiddenStats,
      path: `${node.path}`,
      name: "",
      numberOfLines: hiddenNumberOfLines,
      firstLine: firstHiddenLine,
      color: "grey",
      depth: node.depth + 1,
      height: 0,
      children: [],
    };

    nodes.push(summary);
  }

  return nodes;
}

export function getNodeByPath(root: Node, path: string): Node {
  const pathSegments = path.split("/");
  let node = root;

  for (let i = 1; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    const match = node.children.find((child) => child.name === segment);

    if (match == null) {
      throw new Error(
        `Could not find node "${path}" in "${root.name}": "${node.path}" does not have a child named "${segment}"`,
      );
    }

    node = match;
  }

  return node;
}

export function getNodesAlongPath(root: Node, path: string): Node[] {
  const pathSegments = path.split("/");
  let parent = root;

  return pathSegments.map((segment, i) => {
    if (i === 0) {
      return root;
    }

    const match = parent.children.find((child) => child.name === segment);

    if (match == null) {
      throw new Error(
        `Could not get nodes along path "${path}" in "${root.name}": "${parent.path}" does not have a child named "${segment}"`,
      );
    }

    parent = match;

    return match;
  });
}

export function getParentPath(path: string) {
  return path.split("/").slice(0, -1).join("/");
}
