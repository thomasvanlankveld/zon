import isFile from './isFile';
import { FileSystemNode } from './file-tree';

/**
 * A function to compare two file system nodes, for sorting purposes
 */
interface CompareFunction<FileData extends object, FolderData extends object> {
  (a: FileSystemNode<FileData, FolderData>, b: FileSystemNode<FileData, FolderData>): number;
}

/**
 * Sort nodes recursively.
 *
 * The given `compareFunction` gets passed directly to JavaScript's native [`Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
 *
 * @param root
 * @param compareFunction
 */
export default function sortNodes<
  FileData extends object,
  FolderData extends object,
  ChildrenFileData extends object,
  ChildrenFolderData extends object
>(
  root: FileSystemNode<FileData, FolderData, ChildrenFileData, ChildrenFolderData>,
  compareFunction: CompareFunction<ChildrenFileData, ChildrenFolderData>
): FileSystemNode<FileData, FolderData, ChildrenFileData, ChildrenFolderData> {
  // Nothing to sort if the node is a file
  if (isFile(root)) return root;

  // Sort the children's children, and then the children themselves
  const children = root.children
    .map((child) => sortNodes(child, compareFunction))
    .slice()
    .sort(compareFunction);

  // Merge sorted children back into the root
  return { ...root, children };
}
