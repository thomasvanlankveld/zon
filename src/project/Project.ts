/**
 * Distinguishes files from folders
 */
export enum ProjectItemType {
  Folder,
  File,
}

/**
 * Things both a folder and a file must have
 */
interface ProjectItemBase {
  type: ProjectItemType;
  name: string;
  numberOfLines: number;
}

/**
 * A file with code
 */
export interface File extends ProjectItemBase {
  type: ProjectItemType.File;
}

/**
 * A folder with code
 */
export interface Folder extends ProjectItemBase {
  type: ProjectItemType.Folder;
  content: ProjectItem[];
}

/**
 * A file or folder with code
 */
export type ProjectItem = File | Folder;

/**
 * A project is a folder
 */
export type Project = Folder;
