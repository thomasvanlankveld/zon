import asPathString from './asPathString';
import { File, FileSystemNodeType, Path } from './file-tree';
import pathTip from './pathTip';

/**
 * Create file node
 */
export function createFile(path: Path): File;
export function createFile(path: Path, fileData: undefined): File;
export function createFile<FileData extends object>(path: Path, fileData: FileData): File<FileData>;
export function createFile<FileData extends object>(
  path: Path,
  fileData?: FileData
): File<FileData | {}> {
  return {
    type: FileSystemNodeType.File,
    nodeName: pathTip(path),
    path: asPathString(path),
    data: fileData || {},
  };
}
