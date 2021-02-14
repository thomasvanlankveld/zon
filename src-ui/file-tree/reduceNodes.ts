import { File, FileSystemNode, Folder } from './file-tree';
import isFile from './isFile';

interface ReducerPair<T, FileData extends object, FolderData extends object> {
  fileReducer: (accumulator: T, node: File<FileData>) => T;
  folderReducer: (accumulator: T, node: Folder<FileData, FolderData>) => T;
}

interface Reducer<T, FileData extends object, FolderData extends object> {
  (accumulator: T, node: FileSystemNode<FileData, FolderData>): T;
}

/**
 * Reduce a tree to a value
 *
 * Takes a single reducer to use for all nodes, or an object specifying both or either of "fileReducer" and "folderReducer"
 *
 * @param root The root of the tree to be reduced
 * @param reduction Either a reducer function to apply to all nodes, or an object specifying either or both of "fileReducer" and "folderReducer"
 * @param initialValue The value to start with
 */
export function reduceNodes<T, FileData extends object, FolderData extends object>(
  root: FileSystemNode<FileData, FolderData>,
  reducer: Reducer<T, FileData, FolderData>,
  initialValue: T
): T;
export function reduceNodes<T, FileData extends object, FolderData extends object>(
  root: FileSystemNode<FileData, FolderData>,
  reducers: Partial<ReducerPair<T, FileData, FolderData>>,
  initialValue: T
): T;
export function reduceNodes<T, FileData extends object, FolderData extends object>(
  root: FileSystemNode<FileData, FolderData>,
  reduction: Partial<ReducerPair<T, FileData, FolderData>> | Reducer<T, FileData, FolderData> = {},
  initialValue: T
): T {
  // Extract file and folder reducer
  const { fileReducer, folderReducer } = ((): ReducerPair<T, FileData, FolderData> => {
    // If there is a single given reducer, use it for both files and folders
    if (typeof reduction === 'function')
      return { fileReducer: reduction, folderReducer: reduction };

    // Otherwise return the respective reducers, using an identity function as default if needed
    const defaultReducer = (x: T): T => x;
    return {
      fileReducer: reduction.fileReducer || defaultReducer,
      folderReducer: reduction.folderReducer || defaultReducer,
    };
  })();

  // If the root is a file, apply the file reducer
  if (isFile(root)) return fileReducer(initialValue, root);

  // Reduce all children
  const childrenResult = root.children.reduce((accumulator, child) => {
    return reduceNodes(child, { fileReducer, folderReducer }, accumulator);
  }, initialValue);

  // Pass the result of the reduction of the children to the folder reducer
  return folderReducer(childrenResult, root);
}
