import { zip, partition, uniqBy } from 'lodash';
import { DeepReadonly } from 'utility-types';

/**
 * Path as strings
 */
export type PathString = string;

/**
 * Path as array of path segments
 */
export type PathArray = string[];

/**
 * Types a file system node can be
 */
export enum FileSystemNodeType {
  File = 'File',
  Folder = 'Folder',
}

/**
 * Things both a folder and a file must have
 */
export interface FileSystemNodeBase<NodeData extends object = {}> {
  readonly filename: string;
  readonly path: PathString;
  readonly data: DeepReadonly<NodeData>;
}

/**
 * A file
 */
export type File<FileData extends object = {}> = FileSystemNodeBase<FileData> & {
  readonly type: FileSystemNodeType.File;
};

/**
 * A folder
 */
export type Folder<
  FileData extends object = {},
  FolderData extends object = {}
> = FileSystemNodeBase<FolderData> &
  Readonly<{
    type: FileSystemNodeType.Folder;
    children: ReadonlyArray<FileSystemNode<FileData, FolderData>>;
  }>;

/**
 * A file or folder
 */
export type FileSystemNode<FileData extends object = {}, FolderData extends object = {}> =
  | Folder<FileData, FolderData>
  | File<FileData>;

/**
 * Convert path string to array of path segments
 */
export function toPathArray(pathString: PathString): PathArray {
  return pathString.split('/');
}

/**
 * Convert array of path segments to path string
 */
export function toPathString(pathArray: PathArray): PathString {
  return pathArray.join('/');
}

/**
 * Whether the given item is a folder
 */
export function isFile(item: FileSystemNode): item is File {
  return item.type === FileSystemNodeType.File;
}

/**
 * Whether the given item is a folder
 */
export function isFolder<FileData extends object, FolderData extends object>(
  item: FileSystemNode<FileData, FolderData>
): item is Folder<FileData, FolderData> {
  return item.type === FileSystemNodeType.Folder;
}

/**
 * Get the first path segment
 */
export function pathRoot(path: string): string {
  return toPathArray(path)[0];
}

/**
 * Get the last path segment
 */
export function pathTip(path: string): string {
  return toPathArray(path).slice(-1)[0];
}

/**
 * Create file node
 */
export function createFile(path: string): File;
export function createFile(path: string, fileData: undefined): File;
export function createFile<FileData extends object>(
  path: string,
  fileData: FileData
): File<FileData>;
export function createFile<FileData extends object>(
  path: string,
  fileData?: FileData
): File<FileData | {}> {
  return {
    type: FileSystemNodeType.File,
    filename: pathTip(path),
    path,
    data: fileData || {},
  };
}

/**
 * Create folder node
 */
export function createFolder(path: string): Folder;
export function createFolder<FileData extends object>(path: string): Folder<FileData>;
export function createFolder<FolderData extends object>(
  path: string,
  options: { folderData: FolderData }
): Folder<{}, FolderData>;
export function createFolder<FileData extends object, FolderData extends object>(
  path: string,
  options: { folderData: FolderData }
): Folder<FileData, FolderData>;
export function createFolder<FileData extends object, FolderData extends object>(
  path: string,
  options: { children: FileSystemNode<FileData, FolderData>[] }
): Folder<FileData, FolderData>;
export function createFolder<FileData extends object, FolderData extends object>(
  path: string,
  options: { folderData: FolderData; children: FileSystemNode<FileData, FolderData>[] }
): Folder<FileData, FolderData>;
export function createFolder<FileData extends object, FolderData extends object>(
  path: string,
  options: { folderData?: FolderData; children?: FileSystemNode<FileData, FolderData>[] } = {}
): Folder<FileData | {}, FolderData | {}> {
  const { folderData, children } = options;
  return {
    type: FileSystemNodeType.Folder,
    filename: pathTip(path),
    path,
    data: folderData || {},
    children: children || [],
  };
}

/**
 * Merges two trees.
 *
 * The second node takes precedence over the first node, similar to how `Object.assign` works. Any keys that are present in both nodes will get the values of the second node. This works recursively: For any child nodes that exist in both trees, children of the second node will overwrite any properties also specified by matching children of the first node.
 *
 * This operation is confluently persistent. Both nodes remain unmodified. The returned node is a new object, which shares as many child nodes as possibly with the two source nodes.
 */
export function mergeTrees<
  FileData extends object,
  FolderData extends object,
  First extends FileSystemNode<FileData, FolderData>,
  Second extends FileSystemNode<FileData, FolderData>
>(first: First, second: Second): First & Second {
  // Bail on node type mismatch
  if (first.type !== second.type)
    throw new Error(
      `Failed to merge node with path ${first.path} and type ${first.type} with node with path ${second.path} and type ${second.type}. Types should be the same.`
    );

  // Bail on node path mismatch
  if (first.path !== second.path)
    throw new Error(
      `Failed to merge nodes with paths ${first.path} and ${second.path}. Paths should be the same.`
    );

  // If either node is not a folder, do a simple property merge
  if (!isFolder(first) || !isFolder(second))
    return { ...first, ...second, data: { ...first.data, ...second.data } };

  // Partition the first node's children into unique and shared
  const [uniqueFirstChildren, sharedFirst] = partition(
    first.children,
    (firstChild) => !second.children.some((secondChild) => firstChild.path === secondChild.path)
  );

  // Partition the second node's children into unique and shared
  const [uniqueSecondChildren, sharedSecond] = partition(
    second.children,
    (secondChild) => !first.children.some((firstChild) => firstChild.path === secondChild.path)
  );

  // Merge the shared children as trees
  const mergedChildren = zip(sharedFirst, sharedSecond).map(([firstChild, secondChild]) => {
    if (firstChild == null || secondChild == null)
      throw new Error(
        `This should never happen: Missing one of these two nodes in array zip: ${firstChild}, ${secondChild}. If you see this, file an issue at: https://github.com/thomasvanlankveld/zon/issues`
      );
    return mergeTrees(firstChild, secondChild);
  });

  // Put all unique and merged children together
  const children = [...uniqueFirstChildren, ...uniqueSecondChildren, ...mergedChildren];

  // Merge folders with children
  return { ...first, ...second, children, data: { ...first.data, ...second.data } };
}

/**
 * Adds a node to a tree.
 *
 * The node is placed in the tree by its `path` property, and all intermediate folders are created if necessary.
 *
 * This operation is confluently persistent. The old root remains unmodified. The returned root is a new object. As many nodes as possible are shared between the old and the new tree.
 */
export function rootWithNode<FileData extends object = {}, FolderData extends object = {}>(
  root: FileSystemNode<FileData, FolderData>,
  node: FileSystemNode<FileData, FolderData>
): FileSystemNode<FileData, FolderData> {
  // Extract path from node
  const { path: nodePath } = node;

  // Check that node path fits in root
  if (root.filename !== toPathArray(nodePath)[0]) {
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

/**
 * Whether all of the given files have the same path root
 */
function haveDifferentRoots(files: { path: string }[]): boolean {
  return uniqBy(files, (file) => pathRoot(file.path)).length > 1;
}

/**
 * Whether the given file exists at its path's root
 *
 * This is true when the file's path only has a single element
 */
function existAtRoot(file: { path: string }): boolean {
  return toPathArray(file.path).length === 1;
}

/**
 * Prepend an empty root to the given file
 */
function withEmptyRoot<File extends { path: string }>(file: File): File {
  return { ...file, path: `/${file.path}` };
}

/**
 * Create a tree from an array of files
 */
export function createTreeFromFiles<FileData extends object>(
  files: { path: string; data: FileData }[]
): FileSystemNode<FileData> {
  // Add empty root to all paths if necessary. This is the case under two circumstances. Firstly, if any of the files have different roots, we need to add a common shared root. Secondly, if any of the files exist at the root pathselves, we need to add a root, since the root must be a folder.
  const rootedFiles =
    haveDifferentRoots(files) || files.some(existAtRoot) ? files.map(withEmptyRoot) : files;

  // Get root name from the first path segment of the first file
  const rootName = pathRoot(rootedFiles[0].path);

  // Create an empty root
  const emptyRoot = createFolder<FileData>(rootName);

  // Add all files to the root
  return rootedFiles.reduce<FileSystemNode<FileData>>((root, file) => {
    const fileNode = createFile(file.path, file.data);
    return rootWithNode(root, fileNode);
  }, emptyRoot);
}
