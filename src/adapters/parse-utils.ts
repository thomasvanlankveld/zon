import { isFile, FileSystemNode } from '../utility/file-tree';
import { ProjectItem } from '../project/Project';

/**
 * A file system node with the number of lines on every node
 */
type FSNodeWithNumberOfLines = FileSystemNode<{ numberOfLines: number }>;

/**
 * A file system node with the number of lines on every leaf (but not necessarily on the branches)
 */
type FSNodeWithNumberOfLinesOnLeaves = FileSystemNode<{}, { numberOfLines: number }>;

/**
 * Get a copy of a node, with the number of lines for the node and all its descendants
 */
export function withNumberOfLines(node: FSNodeWithNumberOfLinesOnLeaves): FSNodeWithNumberOfLines {
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
 * Get a copy of a node, with all its descendants sorted by number of lines of code
 */
export function sortedByNumberOfLines(node: FSNodeWithNumberOfLines): FSNodeWithNumberOfLines {
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
 * Half of a number, rounded down
 */
function half(num: number): number {
  return Math.floor(num / 2);
}

/**
 * Get a copy of a node, with the middle line from zero for the node and all its descendants
 */
export function withMiddleLineFromZero(
  node: FSNodeWithNumberOfLines,
  baseline: number
): ProjectItem {
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
