import { Languages, LanguageType } from "../tokei.ts";
import {
  Counted,
  isFile,
  isFolder,
  type LINE_TYPE,
  type Node,
  NODE_TYPE,
} from "./types.ts";
import {
  getLastSegment,
  getPathArray,
  getPathString,
  getParentPath,
} from "./path.ts";
import { getNumberOfLines } from "./lineType.ts";
import { addLanguageCount } from "./language.ts";
import { addChildColorValue, createCounted } from "./counted.ts";

/**
 * Deduce a report path from Tokei output
 *
 * We do this by finding the shared part among all report's names
 */
export function getReportPath(languages: Languages) {
  const languageValues = Object.values(languages);

  const lastLanguage = languageValues[languageValues.length - 1];
  const lastReport = lastLanguage.reports[lastLanguage.reports.length - 1];

  // Initialize to last report, so that we find differences as soon as possible
  let shared = lastReport.name;

  for (const language of languageValues) {
    checkReports: for (const report of language.reports) {
      for (let i = 0; i < shared.length; i++) {
        if (shared[i] !== report.name[i]) {
          // Cut off trailing slash
          const cutoff = i >= 1 && shared[i - 1] === "/" ? i - 1 : i;
          shared = shared.slice(0, cutoff);
          continue checkReports;
        }
      }
    }
  }

  return shared;
}

/**
 * Create a "zon" tree from Tokei output
 */
export function createTree(
  reportPath: string,
  languages: Languages,
  lineTypes: LINE_TYPE[],
): Node {
  const reportName = getLastSegment(reportPath);
  const numberOfCharactersToRemove = reportPath.length - reportName.length;

  // Folders can have files in multiple languages, so ignoring those for now
  const languageEntries = Object.entries(languages);

  const nodes: { [name: string]: Node } = {};

  // For every programming language
  for (const [languageName, language] of languageEntries) {
    // For every file
    for (const tokeiReport of language.reports) {
      const filePathStr = tokeiReport.name.slice(numberOfCharactersToRemove);
      const filePath = getPathArray(filePathStr);

      // Create or update all parent folders, then create the file
      for (let i = 0; i < filePath.length; i++) {
        const nodePath = filePath.slice(0, i + 1);
        const nodePathStr = getPathString(nodePath);

        if (nodePathStr in nodes) {
          const node = nodes[nodePathStr];
          const numberOfLines = getNumberOfLines(tokeiReport.stats, lineTypes);

          node.lineTypes.blanks.numberOfLines += tokeiReport.stats.blanks;
          node.lineTypes.code.numberOfLines += tokeiReport.stats.code;
          node.lineTypes.comments.numberOfLines += tokeiReport.stats.comments;
          node.numberOfLines += numberOfLines;
          node.height = Math.max(node.height, filePath.length - i - 1);

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
            name: filePath[i],
            numberOfLines,
            depth: i,
            // Actual values of `firstLine` and `color` can only be determined after sorting
            firstLine: 0,
            colorValue: 0,
          };

          const isFile = i === filePath.length - 1;
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
                height: filePath.length - i - 1,
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
