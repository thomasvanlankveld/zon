import { Leaf, Branch, Node, NodeTypeLeaf, NodeTypeBranch } from './tree';

/**
 * Path as strings
 */
export type PathString = string;

/**
 * Path as array of path segments
 */
export type PathArray = string[];

/**
 * Denotes a node as file
 */
export type FileSystemNodeTypeFile = NodeTypeLeaf;

/**
 * Denotes a node as file
 */
export const FileSystemNodeTypeFile = NodeTypeLeaf;

/**
 * Denotes a node as folder
 */
export type FileSystemNodeTypeFolder = NodeTypeBranch;

/**
 * Denotes a node as folder
 */
export const FileSystemNodeTypeFolder = NodeTypeBranch;

/**
 * Types a node can be
 */
export type FileSystemNodeType = FileSystemNodeTypeFile | FileSystemNodeTypeFolder;

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
export type File<U extends object = {}> = Leaf<FileSystemNodeBase & U>;

/**
 * A folder
 */
export type Folder<T extends object = {}, U extends object = T> = Branch<
  FileSystemNodeBase & T,
  FileSystemNodeBase & U
>;

/**
 * A file or folder
 */
export type FileSystemNode<T extends object = {}, U extends object = T> = Node<
  FileSystemNodeBase & T,
  FileSystemNodeBase & U
>;

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
  return item.type === FileSystemNodeTypeFile;
}

/**
 * Whether the given item is a folder
 */
export function isFolder<T extends object, U extends object>(
  item: FileSystemNode<T>
): item is Folder<T, U> {
  return item.type === FileSystemNodeTypeFolder;
}

/**
 * Get the name of a file from its path
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
    type: FileSystemNodeTypeFile,
    filename: pathTip(path),
    path,
  };
}

/**
 * Adds a node to a file tree using its path as a location specifier
 */
export function addNodeByPath(root: Folder, path: string, node: FileSystemNode): void {
  // Check that node path fits in root
  if (root.filename !== toPathArray(path)[0]) {
    throw new Error(`Can't add node with path ${path} to a tree with root path ${root.path}`);
  }

  // Initialize parent and path segments
  let lastKnownFolder = root;
  const pathSegments = toPathArray(path).slice(1, -1);

  // For every path element, add a folder to the tree if necessary
  pathSegments.forEach((elem, i) => {
    // Try to find the next folder
    let nextFolder = lastKnownFolder.children.find((childNode) => childNode.filename === elem);
    const nextFolderPath = toPathString([root.filename].concat(pathSegments.slice(0, i + 1)));

    // If it does not exist, create it and append it to the previous folder
    if (nextFolder == null) {
      nextFolder = {
        type: FileSystemNodeTypeFolder,
        filename: elem,
        path: nextFolderPath,
        children: [],
      };
      if (typeof nextFolder === 'undefined') throw new Error('This should never happen');
      lastKnownFolder.children.push(nextFolder);
    }

    // We now know the next folder
    if (isFile(nextFolder))
      throw new Error(
        `Found a file instead of a folder at "${nextFolderPath}" when trying to add a file at "${path}"`
      );
    lastKnownFolder = nextFolder;
  });

  // Add the file to its direct parent folder
  lastKnownFolder.children.push(node);
}

/**
 * Adds a file to a file tree using its path as a location specifier
 */
export function addFileByPath(root: Folder, path: string, fileProps: object): void {
  addNodeByPath(root, path, createFile(path, fileProps));
}

/**
 * Adds a folder to a file tree using its path as a location specifier
 */
export function addFolderByPath(root: Folder, path: string, folderProps?: object): void {
  addNodeByPath(root, path, {
    ...folderProps,
    type: FileSystemNodeTypeFolder,
    filename: pathTip(path),
    path,
    children: [],
  });
}

/**
 * Create a file tree root
 */
export function createRoot<T extends object, U extends object>(
  rootFilename: string,
  rootProps: T
): Folder<T, U> {
  return {
    ...rootProps,
    type: FileSystemNodeTypeFolder,
    filename: pathTip(rootFilename),
    path: rootFilename,
    children: [],
  };
}

/**
 * Create a tree from an array of files
 */
export function createTree<U extends { path: string }>(
  projectName: string,
  files: U[]
): Folder<{}, U> {
  const root: Folder<{}, U> = createRoot(projectName, {});
  files.forEach((file) => {
    const { path, ...fileProps } = file;
    addFileByPath(root, path, fileProps);
  });
  return root;
}
