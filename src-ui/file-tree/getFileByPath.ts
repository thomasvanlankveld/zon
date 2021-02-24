import isFile from './isFile';
import getNodeByPath from './getNodeByPath';
import { File, FileSystemNode, Path } from './file-tree';
import NodeNotFoundError from './NodeNotFoundError';
import asPathString from './asPathString';

/**
 * Find a file in the tree by its path
 */
export default function getFileByPath<FileData extends object, FolderData extends object>(
  root: FileSystemNode<FileData, FolderData>,
  path: Path
): File<FileData> {
  // Find node
  const node = getNodeByPath(root, path);

  // Throw error if node is not a file
  if (!isFile(node)) {
    const pathString = asPathString(path);
    throw new NodeNotFoundError(`Node for path "${pathString}" is not a file`, root, pathString);
  }

  return node;
}
