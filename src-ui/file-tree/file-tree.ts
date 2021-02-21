import { DeepReadonly } from 'utility-types';

/**
 * Path as string
 */
export type PathString = string;

/**
 * Path as array of path segments
 */
export type PathArray = string[];

/**
 * Path as either string or an array of path segments
 */
export type Path = PathString | PathArray;

/**
 * Types a file system node can be
 */
export enum FileSystemNodeType {
  File = 'File',
  Folder = 'Folder',
}

/**
 * Things both a folder and a file must have
 */
export interface FileSystemNodeBase<NodeData extends object = {}> {
  readonly nodeName: string;
  readonly path: PathString;
  readonly data: DeepReadonly<NodeData>;
}

/**
 * A file
 */
export type File<FileData extends object = {}> = FileSystemNodeBase<FileData> & {
  readonly type: FileSystemNodeType.File;
};

/**
 * A folder
 */
export type Folder<
  FileData extends object = {},
  FolderData extends object = {},
  ChildrenFolderData extends object = FolderData
> = FileSystemNodeBase<FolderData> &
  Readonly<{
    type: FileSystemNodeType.Folder;
    children: ReadonlyArray<FileSystemNode<FileData, ChildrenFolderData>>;
  }>;

/**
 * A file or folder
 */
export type FileSystemNode<
  FileData extends object = {},
  FolderData extends object = {},
  ChildrenFileData extends object = FileData,
  ChildrenFolderData extends object = FolderData
> = Folder<ChildrenFileData, FolderData, ChildrenFolderData> | File<FileData>;
