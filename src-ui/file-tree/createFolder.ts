import asPathString from './asPathString';
import { Folder, FileSystemNode, FileSystemNodeType, Path } from './file-tree';
import pathTip from './pathTip';

/**
 * Create folder node
 */
export function createFolder(path: Path): Folder;
export function createFolder<FileData extends object>(path: Path): Folder<FileData>;
export function createFolder<FolderData extends object>(
  path: Path,
  options: { folderData: FolderData }
): Folder<{}, FolderData>;
export function createFolder<FileData extends object, FolderData extends object>(
  path: Path,
  options: { folderData: FolderData }
): Folder<FileData, FolderData>;
export function createFolder<FileData extends object, ChildrenFolderData extends object = {}>(
  path: Path,
  options: { children: FileSystemNode<FileData, {}, {}, ChildrenFolderData>[] }
): Folder<FileData, {}, ChildrenFolderData>;
export function createFolder<FileData extends object, FolderData extends object>(
  path: Path,
  options: { folderData: FolderData; children: FileSystemNode<FileData, FolderData>[] }
): Folder<FileData, FolderData>;
export function createFolder<FileData extends object, FolderData extends object>(
  path: Path,
  options: { folderData?: FolderData; children?: FileSystemNode<FileData, FolderData>[] } = {}
): Folder<FileData | {}, FolderData | {}> {
  const { folderData, children } = options;
  return {
    type: FileSystemNodeType.Folder,
    nodeName: pathTip(path),
    path: asPathString(path),
    data: folderData || {},
    children: children || [],
  };
}
