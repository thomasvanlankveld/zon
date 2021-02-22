import { FileSystemNode } from '../file-tree/file-tree';

export interface ProjectNodeData {
  numberOfLines: number;
  firstLine: number;
  middleLine: number;
  lastLine: number;
}

export type ProjectFileData = ProjectNodeData;
export type ProjectFolderData = ProjectNodeData;

/**
 * A file system node with the number of lines on every leaf (but not necessarily on the branches)
 */
export type Project = FileSystemNode<ProjectFileData, ProjectFolderData>;
