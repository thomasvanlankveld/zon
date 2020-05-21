/**
 * Type of a node
 */
export enum NodeType {
  Branch,
  Leaf,
}

/**
 * Leaf in a tree
 */
export type Leaf<T extends object> = T & {
  type: NodeType.Leaf;
};

/**
 * Branch in a tree
 */
export type Branch<T extends object, U extends object = T> = T & {
  type: NodeType.Branch;
  children: Node<T, U>[];
};

/**
 * Node in a tree
 */
export type Node<T extends object, U extends object = T> = Branch<T, U> | Leaf<U>;
