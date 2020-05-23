import { isFile, FileSystemNode } from '../utility/file-tree';
import { ProjectItem } from './Project';

/**
 * A file system node with the number of lines on every leaf (but not necessarily on the branches)
 */
type FSNodeWithNumberOfLinesOnLeaves = FileSystemNode<{}, { numberOfLines: number }>;

/**
 * A file system node with the number of lines on every node
 */
type FSNodeWithNumberOfLines = FileSystemNode<{ numberOfLines: number }>;

/**
 * A file system node with indications for the bottom, middle and top line on every node
 */
type FSNodeWithLineIndications = FileSystemNode<
  Pick<ProjectItem, 'numberOfLines' | 'bottomLine' | 'middleLine' | 'topLine'>
>;

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
 * Get a copy of a node, with the bottom, middle and top lines from the project's zero for the node
 * and all its descendants
 */
export function withLineIndications(
  node: FSNodeWithNumberOfLines,
  baseline: number
): FSNodeWithLineIndications {
  // Calculate lines
  const bottomLine = baseline;
  const middleLine = baseline + half(node.numberOfLines);
  const topLine = baseline + node.numberOfLines;
  const lines = { bottomLine, middleLine, topLine };

  // For files, simply add the line indications
  if (isFile(node)) return { ...node, ...lines };

  // For folders, add indications to all children, moving up the baseline appropriately
  let childBaseline = baseline;
  const children = node.children.map((child) => {
    const childWithMiddle = withLineIndications(child, childBaseline);
    childBaseline += child.numberOfLines;
    return childWithMiddle;
  });

  // Return the folder with the accurate indications, and all its children with middles
  return { ...node, ...lines, children };
}

/**
 * Add layer number to every node
 */
export function withLayer(node: FSNodeWithLineIndications, layer: number): ProjectItem {
  // For files, simply add the layer number
  if (isFile(node)) return { ...node, layer };

  // For folders, add layer numbers to all children
  const children = node.children.map((child) => withLayer(child, layer + 1));

  // Return the folder with the right layer, and all its children with layers
  return { ...node, children, layer };
}
