import { FileSystemNode, File, FileSystemNodeType } from './file-tree';

/**
 * Whether the given item is a folder
 */
export default function isFile(item: FileSystemNode): item is File {
  return item.type === FileSystemNodeType.File;
}
