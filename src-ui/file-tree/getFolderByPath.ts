import isFolder from './isFolder';
import getNodeByPath from './getNodeByPath';
import { Folder, FileSystemNode, Path } from './file-tree';
import asPathString from './asPathString';
import NodeNotFoundError from './NodeNotFoundError';

/**
 * Find a folder in the tree by its path
 */
export default function getFolderByPath<FileData extends object, FolderData extends object>(
  root: FileSystemNode<FileData, FolderData>,
  path: Path
): Folder<FileData, FolderData> {
  // Find node
  const node = getNodeByPath(root, path);

  // Throw error if node is not a folder
  if (!isFolder(node)) {
    const pathString = asPathString(path);
    throw new NodeNotFoundError(`Node for path "${pathString}" is not a folder`, root, pathString);
  }

  return node;
}
