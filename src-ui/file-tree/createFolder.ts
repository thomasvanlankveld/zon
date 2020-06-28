import { Folder, FileSystemNode, FileSystemNodeType } from './file-tree';
import pathTip from './pathTip';

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
