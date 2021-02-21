import isFile from './isFile';
import { File, FileSystemNode, Folder } from './file-tree';

/**
 * A function that takes a file with one data type and converts it into a file with another data type
 */
export interface FileMapper<FileDataIn extends object, FileDataOut extends object> {
  (node: File<FileDataIn>): File<FileDataOut>;
}

/**
 * A function that takes a folder with one data type and converts it into a folder with another data type
 *
 * The children of the incoming folder have already been converted
 */
export interface FolderMapper<
  FileData extends object,
  FolderDataIn extends object,
  FolderDataOut extends object
> {
  (node: Folder<FileData, FolderDataIn, FolderDataOut>): Folder<FileData, FolderDataOut>;
}

/**
 * A pair of functions that convert nodes with one data type into nodes with another data type
 *
 * The children of incoming folder nodes have already been converted
 */
export interface MapperPair<
  FileDataIn extends object,
  FolderDataIn extends object,
  FileDataOut extends object,
  FolderDataOut extends object
> {
  fileMapper: FileMapper<FileDataIn, FileDataOut>;
  folderMapper: FolderMapper<FileDataOut, FolderDataIn, FolderDataOut>;
}

/**
 * A function that takes a node with one data type and converts it into a node with another data type
 *
 * The children of the incoming node have already been converted
 */
export interface Mapper<
  FileDataIn extends object,
  FolderDataIn extends object,
  FileDataOut extends object,
  FolderDataOut extends object
> {
  (node: FileSystemNode<FileDataIn, FolderDataIn, FileDataOut, FolderDataOut>): FileSystemNode<
    FileDataOut,
    FolderDataOut
  >;
}

/**
 * A mapper that uses the same data for both files and folders
 */
export type UniformMapper<DataIn extends object, DataOut extends object> = Mapper<
  DataIn,
  DataIn,
  DataOut,
  DataOut
>;

/**
 * Map over the nodes of a tree
 *
 * Takes a single mapper to use for all nodes, or an object specifying both or either of "fileMapper" and "folderMapper"
 *
 * @param root The root of the tree to be mapped over
 * @param mapping Either a mapper function to apply to all nodes, or an object specifying either or both of "fileMapper" and "folderMapper"
 */
export function mapNodes<
  FileDataIn extends object,
  FolderDataIn extends object,
  FileDataOut extends object,
  FolderDataOut extends object
>(
  root: FileSystemNode<FileDataIn, FolderDataIn>,
  mapper: Mapper<FileDataIn, FolderDataIn, FileDataOut, FolderDataOut>
): FileSystemNode<FileDataOut, FolderDataOut>;
export function mapNodes<
  FileDataIn extends object,
  FolderDataIn extends object,
  FileDataOut extends object,
  FolderDataOut extends object
>(
  root: FileSystemNode<FileDataIn, FolderDataIn>,
  mappers: MapperPair<FileDataIn, FolderDataIn, FileDataOut, FolderDataOut>
): FileSystemNode<FileDataOut, FolderDataOut>;
export function mapNodes<
  FileDataIn extends object,
  FolderDataIn extends object,
  FileDataOut extends object
>(
  root: FileSystemNode<FileDataIn, FolderDataIn>,
  mappers: {
    fileMapper: FileMapper<FileDataIn, FileDataOut>;
  }
): FileSystemNode<FileDataOut, FolderDataIn>;
export function mapNodes<
  FileDataIn extends object,
  FileDataOut extends object,
  FolderDataIn extends object,
  FolderDataOut extends object
>(
  root: FileSystemNode<FileDataIn, FolderDataIn>,
  mappers: {
    folderMapper: FolderMapper<FileDataIn, FolderDataIn, FolderDataOut>;
  }
): FileSystemNode<FileDataIn, FolderDataOut>;
export function mapNodes<
  FileDataIn extends object,
  FolderDataIn extends object,
  FileDataOut extends object,
  FolderDataOut extends object
>(
  root: FileSystemNode<FileDataIn, FolderDataIn>,
  mapping:
    | Partial<MapperPair<FileDataIn, FolderDataIn, FileDataOut, FolderDataOut>>
    | Mapper<FileDataIn, FolderDataIn, FileDataOut, FolderDataOut>
): FileSystemNode<FileDataIn | FileDataOut, FolderDataIn | FolderDataOut> {
  // Extract file and folder reducer
  const mappers = ((): MapperPair<FileDataIn, FolderDataIn, FileDataOut, FolderDataOut> => {
    // If there is a single given mapper, use it for both files and folders
    if (typeof mapping === 'function')
      return {
        fileMapper: mapping as FileMapper<FileDataIn, FileDataOut>,
        folderMapper: mapping as FolderMapper<FileDataOut, FolderDataIn, FolderDataOut>,
      };

    // Otherwise return the respective mappers, using an identity function as default if needed
    const defaultMapper = <T>(node: T): T => node;
    return {
      fileMapper: mapping.fileMapper || (defaultMapper as FileMapper<FileDataIn, FileDataOut>),
      folderMapper:
        mapping.folderMapper ||
        (defaultMapper as FolderMapper<FileDataOut, FolderDataIn, FolderDataOut>),
    };
  })();
  const { fileMapper, folderMapper } = mappers;

  // If the root is a file, apply the file mapper
  if (isFile(root)) return fileMapper(root);

  // Map all children (recursively)
  const mappedChildren = root.children.map((child) => mapNodes(child, mappers));

  // Merge mapped children into the root (so the folder mapper can use the child results)
  const mergedRoot = { ...root, children: mappedChildren };

  // Map the root and return
  return folderMapper(mergedRoot);
}
