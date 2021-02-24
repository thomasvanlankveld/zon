import { FileSystemNode, PathString } from './file-tree';

/**
 *
 */
export default class NodeNotFoundError<
  FileData extends object,
  FolderData extends object,
  ChildrenFileData extends object,
  ChildrenFolderData extends object
> extends Error {
  public root: FileSystemNode<FileData, FolderData, ChildrenFileData, ChildrenFolderData>;

  public path: PathString;

  constructor(
    message: string,
    root: FileSystemNode<FileData, FolderData, ChildrenFileData, ChildrenFolderData>,
    path: PathString
  ) {
    super(message);
    this.root = root;
    this.path = path;
    Object.setPrototypeOf(this, NodeNotFoundError.prototype);
  }
}
