import isFile from './isFile';
import asPathArray from './asPathArray';
import { FileSystemNode, Path, PathString } from './file-tree';
import NodeNotFoundError from './NodeNotFoundError';
import asPathString from './asPathString';

/**
 * Find a node in the tree by its path
 */
export default function getNodeByPath<FileData extends object, FolderData extends object>(
  currentNode: FileSystemNode<FileData, FolderData>,
  path: Path,
  root: FileSystemNode<FileData, FolderData> = currentNode,
  pathFromRoot: PathString = asPathString(path)
): FileSystemNode<FileData, FolderData> {
  // Get the current segment
  const pathArray = asPathArray(path);
  const [currentSegment, ...nextSegments] = pathArray;

  // On these conditions, we have found the node!
  if (nextSegments.length === 0 && currentNode.nodeName === currentSegment) return currentNode;

  // Encountering a file here means we can't search any deeper
  if (isFile(currentNode))
    throw new NodeNotFoundError(`Can't find node for path "${pathFromRoot}"`, root, pathFromRoot);

  // Find the next node by its path segment
  const nextSegment = nextSegments[0];
  const nextNode = currentNode.children.find((child) => child.nodeName === nextSegment);

  // If we can't find the next node, return none
  if (!nextNode)
    throw new NodeNotFoundError(`Can't find node for path "${pathFromRoot}"`, root, pathFromRoot);

  // Keep searching in the next node
  return getNodeByPath(nextNode, nextSegments, root, pathFromRoot);
}
