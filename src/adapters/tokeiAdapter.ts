import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { flatMap } from 'lodash';

import { Project, ProjectItem } from '../project/Project';
import { Folder, isFile, addFileByPath, createTree, FileSystemNode } from '../utility/file-tree';

/**
 * Allows us to parse Tokei languages
 *
 * No need to be too strict about this, any string will do
 */
const tokeiLanguageType = t.string;

/**
 * Allows us to parse Tokei stats
 *
 * Tokei stats have all sorts of goodies
 */
const tokeiStatsType = t.type({
  blanks: t.number,
  code: t.number,
  comments: t.number,
  lines: t.number,
});

/**
 * Allows us to parse Tokei JSON output
 *
 * This is list of stats per language, including totals for the language and stats per file
 */
const tokeiJsonType = t.type({
  inner: t.record(
    tokeiLanguageType,
    t.intersection([
      tokeiStatsType,
      t.type({
        inaccurate: t.boolean,
        stats: t.array(t.intersection([tokeiStatsType, t.type({ name: t.string })])),
      }),
    ])
  ),
});

/**
 * Lets debuggers know about parse failures
 */
const tokeiParseErrorMessage = 'Could not parse Tokei json';

/**
 *
 */
type FSNodeWithNumberOfLines = FileSystemNode<{ numberOfLines: number }>;
type FSNodeWithNumberOfLinesOnLeaves = FileSystemNode<{}, { numberOfLines: number }>;

/**
 *
 */
function withNumberOfLines(node: FSNodeWithNumberOfLinesOnLeaves): FSNodeWithNumberOfLines {
  // Files already have the number of lines
  if (isFile(node)) return node;

  // For folders, ensure number of lines for all children
  const children = node.children.map(withNumberOfLines);

  // Based on these children, compute the number of lines for this folder
  const numberOfLines = children.reduce((total, item) => total + item.numberOfLines, 0);

  // Return this folder with the accurate number of lines
  return {
    ...node,
    numberOfLines,
    children,
  };
}

/**
 *
 */
function sortedByNumberOfLines(node: FSNodeWithNumberOfLines): FSNodeWithNumberOfLines {
  // No need to sort files
  if (isFile(node)) return node;

  const children = node.children
    // Sort any folders within this folder
    .map(sortedByNumberOfLines)
    // Sort this folder's children by number of lines
    .sort((a, b) => (a.numberOfLines > b.numberOfLines ? -1 : 1));

  // Return the folder with sorted childrens
  return {
    ...node,
    children,
  };
}

/**
 *
 */
function half(num: number): number {
  return Math.floor(num / 2);
}

/**
 *
 */
function withMiddleLineFromZero(node: FSNodeWithNumberOfLines, baseline: number): ProjectItem {
  // For files, simply add the middle line from zero
  if (isFile(node)) return { ...node, middleLineFromZero: baseline + half(node.numberOfLines) };

  // For folders, add middle to all children, moving up the baseline appropriately
  let childBaseline = baseline;
  const children = node.children.map((child) => {
    const childWithMiddle = withMiddleLineFromZero(child, childBaseline);
    childBaseline += child.numberOfLines;
    return childWithMiddle;
  });

  // Return the folder with the accurate middle, and all its children with middles
  return {
    ...node,
    middleLineFromZero: baseline + half(node.numberOfLines),
    children,
  };
}

export default function tokeiAdapter(input: unknown, projectName: string): Project {
  // Parse Tokei JSON
  const parseResult = tokeiJsonType.decode(input);
  if (isLeft(parseResult)) throw new Error(tokeiParseErrorMessage);
  const parsed = parseResult.right;

  // Extract a list of file stats
  const languages = Object.values(parsed.inner);
  const files = flatMap(languages, (language) => language.stats).map((file) => {
    // Swap any "current folder" specifiers in the file paths with the project name
    const path = file.name.split('/');
    if (path[0] === '.') path.splice(0, 1);
    return { ...file, name: path.join('/') };
  });

  const root: Folder<{}, { numberOfLines: number }> = createTree(projectName, {});

  // Construct the file tree
  files.forEach((file) => {
    addFileByPath(root, file.name, { numberOfLines: file.code });
  });

  const rootWithNumberOfLines = withNumberOfLines(root);
  const rootSortedByNumberOfLines = sortedByNumberOfLines(rootWithNumberOfLines);
  const project = withMiddleLineFromZero(rootSortedByNumberOfLines, 0);

  return project;
}
