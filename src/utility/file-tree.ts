import { Leaf, Branch, Node, NodeTypeLeaf, NodeTypeBranch } from './tree';

// /**
//  * Denotes a node as file
//  */
// export type FileSystemNodeTypeFile = typeof NodeType.Leaf;

// /**
//  * Denotes a node as file
//  */
// export const FileSystemNodeTypeFile = NodeType.Leaf;

// /**
//  * Denotes a node as folder
//  */
// export type FileSystemNodeTypeFolder = typeof NodeType.Branch;

// /**
//  * Denotes a node as folder
//  */
// export const FileSystemNodeTypeFolder = NodeType.Branch;

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
  path: string;
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
export function filenameFromPath(path: string): string {
  return path.split('/').slice(-1)[0];
}

/**
 *
 */
export function addNodeByPath(root: Folder, path: string, node: FileSystemNode): void {
  let lastKnownFolder = root;
  const pathSegments = path.split('/').slice(0, -1);

  // For every path element, add a folder to the tree if necessary
  pathSegments.forEach((elem, i) => {
    // Try to find the next folder
    let nextFolder = lastKnownFolder.children.find((childNode) => childNode.filename === elem);
    const nextFolderPath = pathSegments.slice(0, i + 1).join('/');

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
export function addFileByPath(root: Folder, path: string, fileProps?: object): void {
  addNodeByPath(root, path, {
    ...fileProps,
    type: FileSystemNodeTypeFile,
    filename: filenameFromPath(path),
    path,
  });
}

/**
 * Adds a folder to a file tree using its path as a location specifier
 */
export function addFolderByPath(root: Folder, path: string, folderProps?: object): void {
  addNodeByPath(root, path, {
    ...folderProps,
    type: FileSystemNodeTypeFolder,
    filename: filenameFromPath(path),
    path,
    children: [],
  });
}

/**
 * Create a file tree
 */
export function createTree<T extends object, U extends object>(
  rootFilename: string,
  rootProps: T
): Folder<T, U> {
  return {
    ...rootProps,
    type: FileSystemNodeTypeFolder,
    filename: filenameFromPath(rootFilename),
    path: rootFilename,
    children: [],
  };
}
