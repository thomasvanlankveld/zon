import { File, FileSystemNodeType } from './file-tree';
import pathTip from './pathTip';

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
    nodeName: pathTip(path),
    path,
    data: fileData || {},
  };
}
