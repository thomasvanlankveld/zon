import asPathArray from './asPathArray';
import asPathString from './asPathString';
import { FileSystemNode, Path } from './file-tree';
import isFolder from './isFolder';
import NodeNotFoundError from './NodeNotFoundError';

/**
 * Get an array of nodes along the given path
 *
 * @param {FileSystemNode} root Root of the tree
 * @param {Path} path File or folder path
 * @returns {FileSystemNode[]} Array of nodes
 */
export default function getNodesAlongPath<FileData extends object, FolderData extends object>(
  root: FileSystemNode<FileData, FolderData>,
  path: Path
): FileSystemNode<FileData, FolderData>[] {
  // Get the current segment
  const pathArray = asPathArray(path);

  // Get nodes
  return pathArray.reduce<FileSystemNode<FileData, FolderData>[]>((nodes, segment, index) => {
    // The first node should be the root
    if (index === 0) return [root];

    // Get the parent of the node we're searching for
    const parent = nodes[index - 1];

    // Can only find children in a folder
    if (!isFolder(parent))
      throw new NodeNotFoundError(
        `Can't find node for path "${asPathString(path)}": "${parent.path}" is not a folder`,
        parent,
        asPathString([...asPathArray(parent.path), segment])
      );

    // Find the next node
    const nextNode = parent.children.find((child) => child.nodeName === segment);

    // Throw if we didn't find the node
    if (!nextNode)
      throw new NodeNotFoundError(
        `Can't find node for path "${asPathString(path)}": "${
          parent.path
        }" does not have a child "${segment}"`,
        parent,
        asPathString([...asPathArray(parent.path), segment])
      );

    // Append the found node to the list of nodes
    return [...nodes, nextNode];
  }, []);
}
