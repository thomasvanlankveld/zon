import { uniqBy } from 'lodash';
import { FileSystemNode, FileSystemNodeType, File, Folder, Path } from './file-tree';
import pathRoot from './pathRoot';
import { createFile } from './createFile';
import { createFolder } from './createFolder';
import { FolderFactory, insertNode } from './insertNode';
import asPathArray from './asPathArray';

/**
 * Description of a file node
 *
 * The `type` is optional, since a file is the default node
 */
export interface FileDescription<FileData extends object | null> {
  path: Path;
  data?: FileData;
  type?: FileSystemNodeType.File;
}

/**
 * Description of a folder node
 */
export interface FolderDescription<FolderData extends object | null> {
  path: Path;
  data?: FolderData;
  type: FileSystemNodeType.Folder;
}

/**
 * Description of a file system node
 */
export type NodeDescription<
  FileData extends object | null = {},
  FolderData extends object | null = {}
> = FileDescription<FileData> | FolderDescription<FolderData>;

/**
 * Whether all of the given nodes have the same path root
 */
function haveDifferentRoots(nodes: NodeDescription[]): boolean {
  return uniqBy(nodes, (node) => pathRoot(node.path)).length > 1;
}

/**
 * Whether the given file exists at its path's root
 *
 * This is true when the file's path only has a single element
 */
function existAtRoot(node: NodeDescription): boolean {
  return asPathArray(node.path).length === 1;
}

/**
 * Prepend an empty root to the given file
 */
function withEmptyRoot<FileData extends object, FolderData extends object>(
  file: NodeDescription<FileData, FolderData>
): NodeDescription<FileData, FolderData> {
  return { ...file, path: `/${file.path}` };
}

/**
 * Create a tree
 *
 * Accepts an array of file and/or folder descriptions. The type may be specified using the `type` property, which defaults to file:
 *
 * ```typescript
 * const tree = createTree([
 *   { path: 'my-project/foo.ts', type: FileSystemNodeType.File },
 *   { path: 'my-project/src/bar.ts' },
 *   { path: 'my-project/output', type: FileSystemNodeType.Folder },
 * ]);
 * ```
 *
 * Data may be added with a `data` property:
 *
 * ```typescript
 * const tree = createTree([
 *   { path: 'my-project/package.json', data: { numberOfLines: 30 } },
 *   { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
 *   { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
 * ]);
 * ```
 *
 * If folders have data, `createTree` requires a folder factory as second argument. This function must compute the folder data for the folder nodes that get created in-between. The tree is built depth-first, so factory is guaranteed to have been called on all child folders.
 *
 * ```typescript
 * const tree = createTree(
 *   [
 *     {
 *       path: 'my-project/foo',
 *       type: FileSystemNodeType.Folder,
 *       data: { numberOfDescendants: 0 },
 *     },
 *     {
 *       path: 'my-project/bar/baz',
 *       type: FileSystemNodeType.Folder,
 *       data: { numberOfDescendants: 0 },
 *     },
 *   ],
 *   (plainFolder) => ({
 *     ...plainFolder,
 *     data: {
 *       numberOfDescendants: plainFolder.children.reduce((total, child) => {
 *         if (isFolder(child))
 *           return total + child.data.numberOfDescendants;
 *         return total;
 *       }, plainFolder.children.length),
 *     },
 *   })
 * );
 * ```
 *
 * If you require folder data, but none of the directly supplied descriptions are for folders, you need to help `createTree` out with the `FolderFactory<FileData, FolderData>` type. This is how you let it know what folder data to expect:
 *
 * ```typescript
 * const descriptions = [
 *   { path: 'my-project/package.json' },
 *   { path: 'my-project/src/foo.ts' },
 *   { path: 'my-project/src/bar.ts' },
 * ];
 *
 * const folderFactory: FolderFactory<{}, { numberOfChildren: number }> = (plainFolder) => ({
 *   ...plainFolder,
 *   data: { numberOfChildren: plainFolder.children.length },
 * });
 *
 * const tree = createTree(descriptions, folderFactory);
 * ```
 */
export function createTree(items: FolderDescription<null>[]): FileSystemNode;
export function createTree<FileData extends object, FolderData extends object>(
  items: FolderDescription<FolderData>[],
  folderFactory: FolderFactory<FileData, FolderData>
): FileSystemNode<{}, FolderData>;
export function createTree<FileData extends object>(
  items: NodeDescription<FileData, null>[]
): FileSystemNode<FileData>;
export function createTree(items: FileDescription<null>[]): FileSystemNode;
export function createTree<FileData extends object>(
  items: FileDescription<FileData>[]
): FileSystemNode<FileData>;
export function createTree<FileData extends object>(
  items: FileDescription<FileData>[]
): FileSystemNode<FileData>;
export function createTree<FileData extends object, FolderData extends object>(
  items: FileDescription<FileData>[],
  folderFactory: FolderFactory<FileData, FolderData>
): FileSystemNode<FileData, FolderData>;
export function createTree<FileData extends object, FolderData extends object>(
  items: NodeDescription<FileData, FolderData>[],
  folderFactory: FolderFactory<FileData, FolderData>
): FileSystemNode<FileData, FolderData>;
export function createTree<FolderData extends object>(
  items: FileDescription<null>[],
  folderFactory: FolderFactory<{}, FolderData>
): FileSystemNode<{}, FolderData>;
export function createTree<FileData extends object, FolderData extends object>(
  items: NodeDescription<FileData, FolderData>[],
  folderFactory?: FolderFactory<FileData, FolderData>
): FileSystemNode<FileData, FolderData> {
  // Add empty root to all paths if necessary. This is the case under two circumstances. Firstly, if any of the files have different roots, we need to add a common shared root. Secondly, if any of the files exist at the root pathselves, we need to add a root, since the root must be a folder.
  const rootedItems =
    haveDifferentRoots(items) || items.some(existAtRoot) ? items.map(withEmptyRoot) : items;

  // Get root name from the first path segment of the first file
  const rootName = pathRoot(rootedItems[0].path);

  // Create an empty root. We cast its type, because it wil be overwritten by `insertNode`.
  const plainRoot = createFolder(rootName) as FileSystemNode<FileData, FolderData>;

  // Add all files and folders to the root
  return rootedItems.reduce<FileSystemNode<FileData, FolderData>>((root, item) => {
    // Add file
    if (!item.type || item.type === FileSystemNodeType.File) {
      const fileNode = createFile(item.path, item.data || {}) as File<FileData>;
      return insertNode(root, fileNode, folderFactory as FolderFactory<FileData, FolderData>);
    }

    // Add folder
    const folderNode = createFolder(item.path, { folderData: item.data || {} }) as Folder<
      FileData,
      FolderData
    >;
    return insertNode(root, folderNode, folderFactory as FolderFactory<FileData, FolderData>);
  }, plainRoot);
}
