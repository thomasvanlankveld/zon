// /**
//  * Type of a node
//  */
// export enum NodeType {
//   Branch,
//   Leaf,
// }

export const NodeTypeLeaf = 'NodeTypeLeaf';

export type NodeTypeLeaf = 'NodeTypeLeaf';

export const NodeTypeBranch = 'NodeTypeBranch';

export type NodeTypeBranch = 'NodeTypeBranch';

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
