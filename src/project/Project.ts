import { Leaf, Branch, Node, NodeType } from '../utility/tree';

/**
 * Denotes an item as file
 */
export type ItemTypeFile = typeof NodeType.Leaf;

/**
 * Denotes an item as file
 */
export const ItemTypeFile = NodeType.Leaf;

/**
 * Denotes an item as folder
 */
export type ItemTypeFolder = typeof NodeType.Branch;

/**
 * Denotes an item as folder
 */
export const ItemTypeFolder = NodeType.Branch;

/**
 * Things both a folder and a file must have
 */
interface ProjectItemBase {
  filename: string;
  path: string;
  numberOfLines: number;
  medianLineFromZero: number;
}

/**
 * A file with code
 */
export type File = Leaf<ProjectItemBase>;

/**
 * A folder with code
 */
export type Folder = Branch<ProjectItemBase>;

/**
 * A file or folder with code
 */
export type ProjectItem = Node<ProjectItemBase>;

/**
 * A project is a folder
 */
export type Project = Folder;

/**
 * Whether the given item is a folder
 */
export function isFile(item: { type: NodeType }): item is File {
  return item.type === NodeType.Leaf;
}

/**
 * Whether the given item is a folder
 */
export function isFolder(item: { type: NodeType }): item is Folder {
  return item.type === NodeType.Branch;
}
