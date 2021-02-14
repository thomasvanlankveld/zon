import isFolder from './isFolder';
import getNodeByPath from './getNodeByPath';
import { Folder, FileSystemNode, Path } from './file-tree';

/**
 * Find a folder in the tree by its path
 */
export default function getFolderByPath<FileData extends object, FolderData extends object>(
  root: FileSystemNode<FileData, FolderData>,
  path: Path
): Folder<FileData, FolderData> {
  // Find node
  const node = getNodeByPath(root, path);

  // Throw error if something is wrong
  if (!node) throw new TypeError(`No node found for path "${path}"`);
  if (!isFolder(node)) throw new TypeError(`Node for path "${path}" is not a folder`);

  return node;
}
