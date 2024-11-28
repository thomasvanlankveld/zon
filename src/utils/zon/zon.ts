import { rainbow, Cubehelix } from "../color.ts";
import { CodeStats, Languages } from "../tokei.ts";
import {
  type Colors,
  type LineType,
  type Node,
  NODE_TYPE,
  type Path,
  type SegmentName,
} from "./types.ts";
import {
  getProjectName,
  getPathString,
  getParentPath,
  arePathsEqual,
} from "./path.ts";

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
        const nodePath = filePathSegments.slice(0, i + 1);
        const nodePathStr = getPathString(nodePath);

        if (nodePathStr in nodes) {
          const node = nodes[nodePathStr];
          node.stats.blanks += tokeiReport.stats.blanks;
          node.stats.code += tokeiReport.stats.code;
          node.stats.comments += tokeiReport.stats.comments;
          node.numberOfLines += getNumberOfLines(tokeiReport.stats, lineTypes);
          node.height = Math.max(node.height, filePathSegments.length - i - 1);
        } else {
          const nodeBase = {
            stats: tokeiReport.stats,
            path: nodePath,
            name: filePathSegments[i],
            numberOfLines: getNumberOfLines(tokeiReport.stats, lineTypes),
            depth: i,
            // Actual values of `firstLine` and `color` can only be determined after sorting
            firstLine: 0,
            colors: { base: "", highlighted: "", pressed: "" },
          };

          const isFile = i === filePathSegments.length - 1;
          const newNode: Node = isFile
            ? {
                ...nodeBase,
                type: NODE_TYPE.FILE,
                height: 0,
              }
            : {
                ...nodeBase,
                type: NODE_TYPE.FOLDER,
                children: [],
                // `children` updated as we build the tree
                height: filePathSegments.length - i - 1,
              };

          nodes[nodePathStr] = newNode;

          if (i > 0) {
            const parentPath = getParentPath(nodePath);
            const parent = nodes[getPathString(parentPath)];

            if (parent == null) {
              throw new Error(
                `Parent "${getPathString(parentPath)}" of child "${getPathString(nodePath)}" does not exist`,
              );
            }

            if (parent.type !== NODE_TYPE.FOLDER) {
              throw new Error(
                `Parent "${getPathString(parentPath)}" of child "${getPathString(nodePath)}" is not a folder`,
              );
            }

            parent.children.push(newNode);
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
  if (node.type !== NODE_TYPE.FOLDER) {
    return;
  }

  node.children.sort((left, right) =>
    left.numberOfLines < right.numberOfLines ? 1 : -1,
  );

  for (const child of node.children) {
    sortTree(child);
  }
}

function getColors(base: Cubehelix): Colors {
  return {
    base: base.toRgbString(),
    highlighted: base.brighter(0.5).toRgbString(),
    pressed: base.darker(0.25).toRgbString(),
  };
}

function addDeduced(
  node: Node,
  totalNumberOfLines: number,
  lineNumber: number,
): void {
  if (node.type !== NODE_TYPE.FOLDER) {
    return;
  }

  for (const child of node.children) {
    child.firstLine = lineNumber;

    const middleLine = lineNumber + child.numberOfLines / 2;
    child.colors = getColors(rainbow(middleLine / totalNumberOfLines));

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

type GroupOptions = {
  minLines: number;
  maxChildren: number;
};

// TODO: Use darker colors here
const greyColors = getColors(new Cubehelix(0, 0, 0.5, 1));

/**
 * Travels down the root and recursively replaces the smallest nodes with a group of the same size
 * @param node
 * @param options
 * @returns The root node
 */
export function groupSmallestNodes(node: Node, options: GroupOptions): Node {
  if (node.type !== NODE_TYPE.FOLDER) {
    return node;
  }

  const visibleChildren = node.children
    .slice(0, options.maxChildren)
    .filter((child) => child.numberOfLines >= options.minLines)
    .map((child) => groupSmallestNodes(child, options));

  if (visibleChildren.length === node.children.length) {
    return { ...node, children: visibleChildren };
  }

  const hiddenChildren = node.children.slice(visibleChildren.length);

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

  const group: Node = {
    type: NODE_TYPE.GROUP,
    stats: hiddenStats,
    path: [...node.path, NODE_TYPE.GROUP],
    name: NODE_TYPE.GROUP,
    numberOfLines: hiddenNumberOfLines,
    firstLine: firstHiddenLine,
    colors: greyColors,
    depth: node.depth + 1,
    height: 0,
    groupedChildren: hiddenChildren,
  };

  const newChildren = [...visibleChildren, group];

  return {
    ...node,
    children: newChildren,
    height: Math.max(...newChildren.map((child) => child.height)) + 1,
  };
}

/**
 * Returns a copy of `root` with `insertion` inserted at the appropriate path
 * This operation expects all needed folders to already be in place, and it does not recalculate any of the node values
 * @param root The root in which to insert the node
 * @param insertion The node to be inserted
 * @returns Copy of root with insertion
 */
export function withNode(root: Node, insertion: Node): Node {
  const path = insertion.path;

  if (arePathsEqual(root.path, insertion.path)) {
    return insertion;
  }

  if (root.type !== NODE_TYPE.FOLDER) {
    throw new Error(
      `Can't insert node "${getPathString(path)}" into "${getPathString([root.name])}": ${getPathString(root.path)} is not a folder`,
    );
  }

  const newRoot = { ...root };
  let nextNode: Node = newRoot;

  for (let i = 1; i < path.length; i++) {
    const segment = path[i];

    if (nextNode.type !== NODE_TYPE.FOLDER) {
      throw new Error(
        `Can't insert node "${getPathString(path)}" into "${getPathString([root.name])}": ${getPathString(nextNode.path)} is not a folder`,
      );
    }

    const matchIndex = nextNode.children.findIndex(
      (child) => child.name === segment,
    );

    if (matchIndex == null) {
      throw new Error(
        `Can't insert node "${getPathString(path)}" into "${getPathString([root.name])}": "${getPathString(nextNode.path)}" does not have a child named "${getPathString([segment])}"`,
      );
    }

    // If we're at the end of the path, insert the insertion, otherwise clone the next node
    const newNode: Node =
      i === path.length - 1 ? insertion : { ...nextNode.children[matchIndex] };

    nextNode.children = nextNode.children.with(matchIndex, newNode);
    nextNode = newNode;
  }

  return newRoot;
}

// TODO: Move grouping into a tree manipulation function, to maintain consistency between different UI elements?
type GetDescendantsOptions = {
  // TODO: Maybe make `exclude` into a callback?
  exclude?: {
    minLines?: number;
    maxDepth?: number;
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

  if (node.type !== NODE_TYPE.FOLDER) {
    return [node];
  }

  const childDescendants = node.children.flatMap((child) =>
    getDescendants(child, options),
  );

  return [node, ...childDescendants];
}

/**
 * Get a child by its name.
 *
 * If the child is not in its parent's `children`, it will look for it in the parent's "group". This function throws an
 * error if it does not find the child. This function is not recursive, the child has to be a direct child of the
 * parent, or a direct child of the parent's group.
 *
 * @param parent
 * @param childName
 * @param errorPrefix
 * @returns The child
 */
function getChild(
  parent: Node,
  childName: SegmentName,
  errorPrefix: string,
): Node {
  if (parent.type !== NODE_TYPE.FOLDER) {
    throw new Error(
      `${errorPrefix}: "${getPathString(parent.path)}" is not a folder"`,
    );
  }

  const topLevelMatch = parent.children.find(
    (child) => child.name === childName,
  );

  if (topLevelMatch != null) {
    return topLevelMatch;
  }

  const lastChild = parent.children.at(-1);

  if (lastChild == null) {
    throw new Error(
      `${errorPrefix}: "${getPathString(parent.path)}" has no children`,
    );
  }

  if (lastChild.type !== NODE_TYPE.GROUP) {
    throw new Error(
      `${errorPrefix}: "${getPathString(parent.path)}" does not have a child named "${getPathString([childName])}" and it has no grouped children`,
    );
  }

  const groupedChildrenMatch = lastChild.groupedChildren.find(
    (child) => child.name === childName,
  );

  if (groupedChildrenMatch == null) {
    throw new Error(
      `${errorPrefix}: "${getPathString(parent.path)}" has neither a direct child nor a grouped child named "${getPathString([childName])}"`,
    );
  }

  return groupedChildrenMatch;
}

/**
 * Get a node by its path.
 *
 * This function ignores groups unless they are at the end of the path. The root node must contain the entire path. This
 * function throws an error if it can not find the node.
 *
 * @param root
 * @param path
 * @returns The found node
 */
export function getNodeByPath(root: Node, path: Path): Node {
  const errorPrefix = `Can't find node "${getPathString(path)}" in "${getPathString([root.name])}"`;
  let node = root;

  for (let i = 1; i < path.length; i++) {
    const segment = path[i];

    if (segment === NODE_TYPE.GROUP && i !== path.length - 1) {
      continue;
    }

    if (node.type !== NODE_TYPE.FOLDER) {
      throw new Error(
        `${errorPrefix}: ${getPathString(node.path)} is not a folder`,
      );
    }

    node = getChild(node, segment, errorPrefix);
  }

  return node;
}

/**
 * Get an array of the nodes along a given path.
 *
 * This function ignores groups unless they are at the end of the path. The root node must contain the entire path. This
 * function throws an error if any of the nodes can not be found.
 *
 * @param root
 * @param path
 * @returns The found node
 */
export function getNodesAlongPath(root: Node, path: Path): Node[] {
  const errorPrefix = `Can't get nodes along path "${getPathString(path)}" in "${getPathString([root.name])}"`;
  let parent = root;

  return path
    .map((segment, i) => {
      if (i === 0) {
        return root;
      }

      if (segment === NODE_TYPE.GROUP && i !== path.length - 1) {
        return null;
      }

      if (parent.type !== NODE_TYPE.FOLDER) {
        throw new Error(
          `${errorPrefix}: "${getPathString(parent.path)}" is not a folder"`,
        );
      }

      const match = getChild(parent, segment, errorPrefix);

      parent = match;

      return match;
    })
    .filter((node) => node !== null);
}
