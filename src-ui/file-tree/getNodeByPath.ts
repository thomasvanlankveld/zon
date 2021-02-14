import { isFile } from '.';
import asPathArray from './asPathArray';
import { FileSystemNode, Path } from './file-tree';

/**
 * Find a node in the tree by its path
 */
export default function getNodeByPath<FileData extends object, FolderData extends object>(
  root: FileSystemNode<FileData, FolderData>,
  path: Path
): FileSystemNode<FileData, FolderData> | null {
  // Get the current segment
  const pathArray = asPathArray(path);
  const [currentSegment, ...nextSegments] = pathArray;

  // On these conditions, we're found the node!
  if (nextSegments.length === 0 && root.filename === currentSegment) return root;

  // Encountering a file here means we can't search any deeper
  if (isFile(root)) return null;

  // Find the next node by its path segment
  const nextSegment = nextSegments[0];
  const nextNode = root.children.find((child) => child.filename === nextSegment);

  // If we can't find the next node, return none
  if (!nextNode) return null;

  // Keep searching in the next node
  return getNodeByPath(nextNode, nextSegments);
}
