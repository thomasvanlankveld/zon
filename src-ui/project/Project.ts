import { FileSystemNode } from '../utility/file-tree';

/**
 * A file system node with the number of lines on every leaf (but not necessarily on the branches)
 */
export type Project = FileSystemNode<{ numberOfLines: number }>;
