import { zip, partition } from 'lodash';

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
export interface FileSystemNodeBase {
  filename: string;
  path: PathString;
}

/**
 * A file
 */
export type File<U extends object = {}> = FileSystemNodeBase &
  U & {
    type: FileSystemNodeType.File;
  };

/**
 * A folder
 */
export type Folder<T extends object = {}, U extends object = T> = FileSystemNodeBase &
  T & {
    type: FileSystemNodeType.Folder;
    children: FileSystemNode<T, U>[];
  };

/**
 * A file or folder
 */
export type FileSystemNode<T extends object = {}, U extends object = T> = Folder<T, U> | File<U>;

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
export function isFolder<T extends object, U extends object>(
  item: FileSystemNode<T>
): item is Folder<T, U> {
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
export function createFile(path: string): File<{}>;
export function createFile(path: string, fileProps: undefined): File<{}>;
export function createFile<U extends object>(path: string, fileProps: U): File<U>;
export function createFile<U extends object>(path: string, fileProps?: U): File<U | {}> {
  return {
    ...fileProps,
    type: FileSystemNodeType.File,
    filename: pathTip(path),
    path,
  };
}

/**
 * Create folder node
 */
export function createFolder(path: string): Folder<{}, {}>;
export function createFolder<T extends object>(
  path: string,
  options: { folderProps: T }
): Folder<T, {}>;
export function createFolder<T extends object, U extends object>(
  path: string,
  options: { children: FileSystemNode<T, U>[] }
): Folder<T, U>;
export function createFolder<T extends object, U extends object>(
  path: string,
  options: { folderProps: T; children: FileSystemNode<T, U>[] }
): Folder<T, U>;
export function createFolder<T extends object, U extends object>(
  path: string,
  options: { folderProps?: T; children?: FileSystemNode<T, U>[] } = {}
): Folder<T | {}, U | {}> {
  const { folderProps, children } = options;
  return {
    ...folderProps,
    type: FileSystemNodeType.Folder,
    filename: pathTip(path),
    path,
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
export function mergeTrees<T extends object, U extends object>(
  first: FileSystemNode<T, U>,
  second: FileSystemNode<T, U>
): FileSystemNode<T, U> {
  // If either node is a file, do a simple property merge
  if (isFile(first) || isFile(second)) return { ...first, ...second };

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
  return { ...first, ...second, children };
}

/**
 * Adds a node to a tree.
 *
 * The node is placed in the tree by its `path` property, and all intermediate folders are created if necessary.
 *
 * This operation is confluently persistent. The old root remains unmodified. The returned root is a new object. As many nodes as possible are shared between the old and the new tree.
 */
export function rootWithNode<T extends object, U extends object>(
  root: FileSystemNode<T, U>,
  node: FileSystemNode<T, U>
): FileSystemNode<T, U> {
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
  const newRoot = reversedPaths.reduce<FileSystemNode>(
    (child, folderPath) => createFolder(folderPath, { children: [child] }),
    node
  );

  // Merge the new and old tree into one
  return mergeTrees(root, newRoot);
}

/**
 * Create a file tree root
 */
export function createRoot<T extends object, U extends object>(
  rootFilename: string,
  rootProps: T
): Folder<T, U> {
  return createFolder(rootFilename, { folderProps: rootProps });
}

/**
 * Create a tree from an array of files
 */
export function createTreeFromFiles<U extends { path: string }>(files: U[]): FileSystemNode<{}, U> {
  // Get root name from the first path segment of the first file
  const rootName = pathRoot(files[0].path);

  // Create an empty root
  const emptyRoot = createRoot<{}, U>(rootName, {});

  // Add all files to the root
  return files.reduce<FileSystemNode<{}, U>>(
    (root, file) => rootWithNode<{}, U>(root, createFile(file.path, file)),
    emptyRoot
  );
}
