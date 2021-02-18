import isFile from './isFile';
import { File, FileSystemNode, Folder } from './file-tree';

export interface FileMapper<FileDataIn extends object, FileDataOut extends object> {
  (node: File<FileDataIn>): File<FileDataOut>;
}

export interface FolderMapper<
  FileDataIn extends object,
  FolderDataIn extends object,
  FolderDataOut extends object
> {
  (node: Folder<FileDataIn, FolderDataIn>): Folder<FileDataIn, FolderDataOut>;
}

export interface MapperPair<
  FileDataIn extends object,
  FolderDataIn extends object,
  FileDataOut extends object,
  FolderDataOut extends object
> {
  fileMapper: FileMapper<FileDataIn, FileDataOut>;
  folderMapper: FolderMapper<FileDataIn, FolderDataIn, FolderDataOut>;
}

export interface Mapper<
  FileDataIn extends object,
  FolderDataIn extends object,
  FileDataOut extends object,
  FolderDataOut extends object
> {
  (node: FileSystemNode<FileDataIn, FolderDataIn>): FileSystemNode<FileDataOut, FolderDataOut>;
}

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
  const mappers = ((): MapperPair<
    FileDataIn,
    FolderDataIn,
    FileDataIn | FileDataOut,
    FolderDataIn | FolderDataOut
  > => {
    // If there is a single given mapper, use it for both files and folders
    if (typeof mapping === 'function')
      return {
        fileMapper: mapping as FileMapper<FileDataIn, FileDataOut>,
        folderMapper: mapping as FolderMapper<FileDataIn, FolderDataIn, FolderDataOut>,
      };

    // Otherwise return the respective mappers, using an identity function as default if needed
    const defaultMapper = <T>(node: T): T => node;
    return {
      fileMapper: mapping.fileMapper || (defaultMapper as FileMapper<FileDataIn, FileDataIn>),
      folderMapper:
        mapping.folderMapper ||
        (defaultMapper as FolderMapper<FileDataIn, FolderDataIn, FolderDataIn>),
    };
  })();
  const { fileMapper, folderMapper } = mappers;

  // If the root is a file, apply the file mapper
  if (isFile(root)) return fileMapper(root);

  // Map all children (recursively) and the root
  const mappedChildren = root.children.map((child) => mapNodes(child, mappers));
  const mappedRoot = folderMapper(root);

  // Merge the mapped root with its children
  return { ...mappedRoot, children: mappedChildren };
}
