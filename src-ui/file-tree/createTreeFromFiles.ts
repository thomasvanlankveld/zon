import { uniqBy } from 'lodash';
import { FileSystemNode } from './file-tree';
import toPathArray from './toPathArray';
import pathRoot from './pathRoot';
import { createFile } from './createFile';
import { createFolder } from './createFolder';
import { insertNode } from './insertNode';

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
export function createTreeFromFiles(files: { path: string }[]): FileSystemNode;
export function createTreeFromFiles<FileData extends object>(
  files: { path: string; data: FileData }[]
): FileSystemNode<FileData>;
export function createTreeFromFiles(
  files: { path: string; data?: object }[]
): FileSystemNode<object> {
  // Add empty root to all paths if necessary. This is the case under two circumstances. Firstly, if any of the files have different roots, we need to add a common shared root. Secondly, if any of the files exist at the root pathselves, we need to add a root, since the root must be a folder.
  const rootedFiles =
    haveDifferentRoots(files) || files.some(existAtRoot) ? files.map(withEmptyRoot) : files;

  // Get root name from the first path segment of the first file
  const rootName = pathRoot(rootedFiles[0].path);

  // Create an empty root
  const emptyRoot = createFolder<object>(rootName);

  // Add all files to the root
  return rootedFiles.reduce<FileSystemNode<object>>((root, file) => {
    const fileNode = createFile(file.path, file.data || {});
    return insertNode(root, fileNode);
  }, emptyRoot);
}
