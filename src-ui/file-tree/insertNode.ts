import { FileSystemNode, Folder } from './file-tree';
import toPathArray from './toPathArray';
import toPathString from './toPathString';
import { createFolder } from './createFolder';
import mergeTrees from './mergeTrees';
import pathRoot from './pathRoot';
import getFolderByPath from './getFolderByPath';
import NodeNotFoundError from './NodeNotFoundError';

/**
 * Factory to allow you to construct folder data for folders that are created in-between when inserting a new node.
 */
export interface FolderFactory<FileData extends object, FolderData extends object> {
  (plainFolder: Folder<FileData, {}, FolderData>): Folder<FileData, FolderData>;
}

/**
 * Creates a new tree with the node added.
 *
 * The node is placed in the tree by its `path` property, and all intermediate folders are created if necessary:
 *
 * ```typescript
 * const root = createFolder('my-project');
 * const grandChild = createFile('my-project/folder/file.ts');
 * const relatedRoot = insertNode(root, grandChild);
 * ```
 *
 * Using this function on a tree that has folder data requires supplying a `FolderFactory` to construct this data:
 *
 * ```typescript
 * const root = createFolder('my-project', { folderData: { numberOfChildren: 0 } });
 * const grandChild = createFile('my-project/folder/file.ts');
 * const relatedRoot = insertNode(root, grandChild, (folder) => ({
 *   ...folder,
 *   data: { numberOfChildren: folder.children.length },
 * }));
 * ```
 *
 * This operation is confluently persistent. The old root remains unmodified. The returned root is a new object. As many nodes as possible are shared between the old and the new tree.
 */
export function insertNode<FileData extends object = {}>(
  root: FileSystemNode<FileData>,
  node: FileSystemNode<FileData>
): FileSystemNode<FileData>;
export function insertNode<FileData extends object, FolderData extends object>(
  root: FileSystemNode<FileData, FolderData>,
  node: FileSystemNode<FileData, FolderData>,
  folderFactory: FolderFactory<FileData, FolderData>
): FileSystemNode<FileData, FolderData>;
export function insertNode<FileData extends object = {}, FolderData extends object = {}>(
  root: FileSystemNode<FileData, FolderData>,
  node: FileSystemNode<FileData, FolderData>,
  folderFactory?: FolderFactory<FileData, FolderData>
): FileSystemNode<FileData, FolderData> {
  // Extract path from node
  const { path: nodePath } = node;

  // Check that node path fits in root
  if (root.nodeName !== pathRoot(nodePath)) {
    throw new Error(`Can't add node with path ${nodePath} to a tree with root path ${root.path}`);
  }

  // Create a tree containing only a path to the new node
  const pathElements = toPathArray(nodePath);
  // Get an array of paths for the folders we need to create
  const pathsInBetween = pathElements
    // Drop the last path element, since we'll be using the given node there instead of creating a folder
    .slice(0, pathElements.length - 1)
    // Map elements to paths up to that point
    .map((_, i, segments) => toPathString(segments.slice(0, i + 1)));
  // Order paths in between from new node to root
  const reversedPaths = pathsInBetween.reverse();

  // Create new folder nodes from new node up to root
  const newRoot = reversedPaths.reduce<FileSystemNode<FileData, {}, {}, FolderData>>(
    (child, folderPath) => {
      // If there is no factory, just create a parent folder and return
      if (folderFactory == null) return createFolder(folderPath, { children: [child] });
      // TODO: Fix this! (Maybe a TypeScript version upgrade will suffice?)
      const nonNullFolderFactory = folderFactory as FolderFactory<FileData, FolderData>;

      // Try to find any siblings from root
      const siblings = ((): readonly FileSystemNode<FileData, FolderData>[] => {
        try {
          return getFolderByPath(root, folderPath).children;
        } catch (errr) {
          // There's a good chance the folder won't exist yet, in which case there are no siblings
          if (errr instanceof NodeNotFoundError) return [];
          throw errr;
        }
      })();

      // Create parent folder node
      const plainFolder = createFolder(folderPath, { children: [...siblings, child] });

      // Take it through the factory to constuct folder data
      return nonNullFolderFactory(plainFolder);
    },
    node
  ) as FileSystemNode<FileData, FolderData>;

  // Merge the new and old tree into one
  return mergeTrees(root, newRoot);
}
