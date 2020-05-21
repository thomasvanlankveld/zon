import {
  FileSystemNodeTypeFile,
  FileSystemNodeTypeFolder,
  FileSystemNodeBase,
  File,
  Folder,
  FileSystemNode,
} from '../utility/file-tree';

/**
 * Denotes an item as file
 */
export type ProjectItemTypeFile = FileSystemNodeTypeFile;

/**
 * Denotes an item as file
 */
export const ProjectItemTypeFile = FileSystemNodeTypeFile;

/**
 * Denotes an item as folder
 */
export type ProjectItemTypeFolder = FileSystemNodeTypeFolder;

/**
 * Denotes an item as folder
 */
export const ProjectItemTypeFolder = FileSystemNodeTypeFolder;

/**
 * Types a project item can be
 */
export type ProjectItemType = ProjectItemTypeFile | ProjectItemTypeFolder;

/**
 * Things both a folder and a file must have
 */
export interface ProjectItemBase extends FileSystemNodeBase {
  numberOfLines: number;
  middleLineFromZero: number;
}

/**
 * A file with code
 */
export type ProjectFile = File<ProjectItemBase>;

/**
 * A folder with code
 */
export type ProjectFolder = Folder<ProjectItemBase>;

/**
 * A file or folder with code
 */
export type ProjectItem = FileSystemNode<ProjectItemBase>;

/**
 * A project is a folder
 */
export type Project = ProjectItem;

/**
 * Whether the given item is a folder
 */
export function isFile(item: ProjectItem): item is ProjectFile {
  return item.type === ProjectItemTypeFile;
}

/**
 * Whether the given item is a folder
 */
export function isFolder(item: ProjectItem): item is ProjectFolder {
  return item.type === ProjectItemTypeFolder;
}
