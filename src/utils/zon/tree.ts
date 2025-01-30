import { Languages, LanguageType } from "../tokei.ts";
import {
  Counted,
  GROUP_SEGMENT,
  isFile,
  isFolder,
  type LINE_TYPE,
  type Node,
  NODE_TYPE,
} from "./types.ts";
import { getLastSegment, getPathString, getParentPath } from "./path.ts";
import {
  getNumberOfLines,
  sumLineTypeCounts as sumLineTypeCounts,
  subtractLineTypeCounts,
} from "./lineType.ts";
import {
  addLanguageCount,
  subtractLanguageCounts,
  sumLanguageCounts,
} from "./language.ts";
import {
  addChildColorValue,
  createCounted,
  subtractChild,
  sumCounted,
} from "./counted.ts";

/**
 * Create a "zon" tree from Tokei output
 */
export function createTree(
  reportPath: string,
  languages: Languages,
  lineTypes: LINE_TYPE[],
) {
  const reportName = getLastSegment(reportPath);
  const numberOfCharactersToRemove = reportPath.length - reportName.length;

  // Folders can have files in multiple languages, so ignoring those for now
  const languageEntries = Object.entries(languages);

  const nodes: { [name: string]: Node } = {};

  // For every programming language
  for (const [languageName, language] of languageEntries) {
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
          const numberOfLines = getNumberOfLines(tokeiReport.stats, lineTypes);

          node.lineTypes.blanks.numberOfLines += tokeiReport.stats.blanks;
          node.lineTypes.code.numberOfLines += tokeiReport.stats.code;
          node.lineTypes.comments.numberOfLines += tokeiReport.stats.comments;
          node.numberOfLines += numberOfLines;
          node.height = Math.max(node.height, filePathSegments.length - i - 1);

          addLanguageCount(
            node.languages,
            languageName as LanguageType,
            numberOfLines,
          );
        } else {
          const numberOfLines = getNumberOfLines(tokeiReport.stats, lineTypes);

          const nodeBase = {
            // TO DO: Add test to verify non-modification of `lineTypes`
            lineTypes: {
              blanks: createCounted(tokeiReport.stats.blanks),
              code: createCounted(tokeiReport.stats.code),
              comments: createCounted(tokeiReport.stats.comments),
            },
            languages: { [languageName]: createCounted(numberOfLines) },
            path: nodePath,
            name: filePathSegments[i],
            numberOfLines,
            depth: i,
            // Actual values of `firstLine` and `color` can only be determined after sorting
            firstLine: 0,
            colorValue: 0,
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

            if (!isFolder(parent)) {
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

  const root = nodes[reportName];

  sortTree(root);
  addDeduced(root, root.numberOfLines, 0);

  return root;
}

function sortTree(node: Node): void {
  if (!isFolder(node)) {
    return;
  }

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
  if (!isFolder(node)) {
    return;
  }

  for (const child of node.children) {
    // Line position
    child.firstLine = lineNumber;
    const middleLine = lineNumber + child.numberOfLines / 2;

    // Color value
    child.colorValue = middleLine / totalNumberOfLines;
    if (isFile(child)) {
      child.lineTypes.blanks.colorValue = child.colorValue;
      child.lineTypes.code.colorValue = child.colorValue;
      child.lineTypes.comments.colorValue = child.colorValue;
      Object.values(child.languages).forEach(
        (counted) => (counted.colorValue = child.colorValue),
      );
    }

    // Recursive call
    // This must happen before determining the line type and language color values, because those depend on the values
    // of their children
    addDeduced(child, totalNumberOfLines, lineNumber);

    // Line type colors
    addChildColorValue(node.lineTypes.blanks, child.lineTypes.blanks);
    addChildColorValue(node.lineTypes.code, child.lineTypes.code);
    addChildColorValue(node.lineTypes.comments, child.lineTypes.comments);

    // Language colors
    Object.entries(child.languages).forEach(([languageName, childLanguage]) => {
      addChildColorValue(
        node.languages[languageName as LanguageType] as Counted,
        childLanguage,
      );
    });

    // Update loop position
    lineNumber += child.numberOfLines;
  }
}

type GroupOptions = {
  minLines: number;
  maxChildren: number;
  ignoreMinLinesForRoot: boolean;
};

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
  if (!isFolder(node)) {
    return node;
  }

  const minLines = options.ignoreMinLinesForRoot ? 0 : options.minLines;

  const visibleChildren = node.children
    .slice(0, options.maxChildren)
    .filter((child) => child.numberOfLines >= minLines)
    .map((child) =>
      groupSmallestNodes(child, { ...options, ignoreMinLinesForRoot: false }),
    );

  if (visibleChildren.length === node.children.length) {
    return {
      ...node,
      children: visibleChildren,
      height: getHeight(visibleChildren),
    };
  }

  const hiddenChildren = node.children.slice(visibleChildren.length);

  // The number of hidden nodes may be much larger than the number of visible ones, so we calculate the hidden line type
  // and language counts by subtracting the visible totals from the parent's total
  // TODO: Pick hidden-first or visible-first strategy based on whether the number of visible children is more or less
  // than half the parent's total number of children
  const visibleCounted = sumCounted(visibleChildren);
  const hiddenCounted = subtractChild(node, visibleCounted);
  const visibleLineTypeCounts = sumLineTypeCounts(
    visibleChildren.map((child) => child.lineTypes),
  );
  const hiddenLineTypeCounts = subtractLineTypeCounts(
    node.lineTypes,
    visibleLineTypeCounts,
    hiddenCounted.colorValue,
  );
  const visibleLanguageCounts = sumLanguageCounts(
    visibleChildren.map((child) => child.languages),
  );
  const hiddenLanguageCounts = subtractLanguageCounts(
    node.languages,
    visibleLanguageCounts,
  );

  const lastVisibleChild = visibleChildren.at(-1);
  const firstHiddenLine =
    lastVisibleChild != null
      ? lastVisibleChild.firstLine + lastVisibleChild.numberOfLines
      : node.firstLine;

  const group: Node = {
    type: NODE_TYPE.GROUP,
    lineTypes: hiddenLineTypeCounts,
    languages: hiddenLanguageCounts,
    path: [...node.path, GROUP_SEGMENT],
    name: GROUP_SEGMENT,
    numberOfLines: hiddenCounted.numberOfLines,
    colorValue: hiddenCounted.colorValue,
    firstLine: firstHiddenLine,
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
