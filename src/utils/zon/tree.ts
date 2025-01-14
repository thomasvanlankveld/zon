import { Cubehelix } from "../color.ts";
import { Languages } from "../tokei.ts";
import { type Colors, type LINE_TYPE, type Node, NODE_TYPE } from "./types.ts";
import { getProjectName, getPathString, getParentPath } from "./path.ts";
import { getNumberOfLines, sumStats, subtractStats } from "./stats.ts";

export const rootColors = (() => {
  const base = new Cubehelix(0, 0, 0.8, 1);

  return {
    base: base.toRgbString(),
    highlighted: base.brighter(1).toRgbString(),
    pressed: base.darker(0.25).toRgbString(),
  };
})();

export function createTree(
  projectPath: string,
  languages: Languages,
  lineTypes: LINE_TYPE[],
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
            colors: { ...rootColors },
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

export function getRainbowColors(value: number) {
  const position = (value + 0.8) % 1;

  const baseLightness = 82;
  const chroma = 0.31;
  const hue = position * 360;
  const chromaCorrection = 0.15 + Math.abs(0.5 - ((value + 0.25) % 1));

  return {
    base: `oklch(${baseLightness}% ${chroma} ${hue})`,
    highlighted: `oklch(${baseLightness + 10}% ${(1 - chromaCorrection) * chroma} ${hue})`,
    pressed: `oklch(${baseLightness + 15}% ${(1 - 1.3 * chromaCorrection) * chroma} ${hue})`,
  };
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
    child.colors = getRainbowColors(middleLine / totalNumberOfLines);

    addDeduced(child, totalNumberOfLines, lineNumber);

    lineNumber += child.numberOfLines;
  }
}

type GroupOptions = {
  minLines: number;
  maxChildren: number;
};

const greyColors = getColors(new Cubehelix(0, 0, 0.6, 1));

/**
 * Determines the height of a node based on its children
 */
function getHeight(children: Node[]): number {
  return Math.max(...children.map((child) => child.height)) + 1;
}

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
    return {
      ...node,
      children: visibleChildren,
      height: getHeight(visibleChildren),
    };
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
    height: getHeight(newChildren),
  };
}
