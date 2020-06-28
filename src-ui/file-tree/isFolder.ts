import { FileSystemNode, Folder, FileSystemNodeType } from './file-tree';

/**
 * Whether the given item is a folder
 */
export default function isFolder<FileData extends object, FolderData extends object>(
  item: FileSystemNode<FileData, FolderData>
): item is Folder<FileData, FolderData> {
  return item.type === FileSystemNodeType.Folder;
}
