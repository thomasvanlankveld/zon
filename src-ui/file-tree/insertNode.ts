import { FileSystemNode } from './file-tree';
import toPathArray from './toPathArray';
import toPathString from './toPathString';
import { createFolder } from './createFolder';
import mergeTrees from './mergeTrees';

/**
 * "Adds" a node to a tree.
 *
 * The node is placed in the tree by its `path` property, and all intermediate folders are created if necessary.
 *
 * This operation is confluently persistent. The old root remains unmodified. The returned root is a new object. As many nodes as possible are shared between the old and the new tree.
 */
export default function insertNode<FileData extends object = {}, FolderData extends object = {}>(
  root: FileSystemNode<FileData, FolderData>,
  node: FileSystemNode<FileData, FolderData>
): FileSystemNode<FileData, FolderData> {
  // Extract path from node
  const { path: nodePath } = node;

  // Check that node path fits in root
  if (root.nodeName !== toPathArray(nodePath)[0]) {
    throw new Error(`Can't add node with path ${nodePath} to a tree with root path ${root.path}`);
  }

  // Create a tree containing only a path to the new node
  const pathElements = toPathArray(nodePath);
  // Get an array of paths for the folders we need to create
  const pathsInBetween = pathElements
    // Drop the last path element, since we'll be using the given node there instead of creating a folder
    .slice(0, pathElements.length - 1)
    // Map elements to paths up to that point
    .map((_, i, arr) => toPathString(arr.slice(0, i + 1)));
  // Order paths in between from new node to root
  const reversedPaths = pathsInBetween.reverse();
  // Create new folder nodes from new node up to root
  const newRoot = reversedPaths.reduce(
    (child, folderPath) => createFolder(folderPath, { children: [child] }),
    node
  );

  // Merge the new and old tree into one
  return mergeTrees(root, newRoot);
}
