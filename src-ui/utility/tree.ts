/**
 * Denotes a node as a leaf
 */
export const NodeTypeLeaf = 'NodeTypeLeaf';

/**
 * Denotes a node as a leaf
 */
export type NodeTypeLeaf = 'NodeTypeLeaf';

/**
 * Denotes a node as a branch
 */
export const NodeTypeBranch = 'NodeTypeBranch';

/**
 * Denotes a node as a branch
 */
export type NodeTypeBranch = 'NodeTypeBranch';

/**
 * Types a node can be
 */
export type NodeType = NodeTypeLeaf | NodeTypeBranch;

/**
 * Leaf in a tree
 */
export type Leaf<T extends object> = T & {
  type: NodeTypeLeaf;
};

/**
 * Branch in a tree
 */
export type Branch<T extends object, U extends object = T> = T & {
  type: NodeTypeBranch;
  children: Node<T, U>[];
};

/**
 * Node in a tree
 */
export type Node<T extends object, U extends object = T> = Branch<T, U> | Leaf<U>;
