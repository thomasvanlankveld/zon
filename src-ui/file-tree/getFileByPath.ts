import isFile from './isFile';
import getNodeByPath from './getNodeByPath';
import { File, FileSystemNode, Path } from './file-tree';

/**
 * Find a file in the tree by its path
 */
export default function getFileByPath<FileData extends object, FolderData extends object>(
  root: FileSystemNode<FileData, FolderData>,
  path: Path
): File<FileData> {
  // Find node
  const node = getNodeByPath(root, path);

  // Throw error if something is wrong
  if (!node) throw new TypeError(`No node found for path "${path}"`);
  if (!isFile(node)) throw new TypeError(`Node for path "${path}" is not a file`);

  return node;
}
