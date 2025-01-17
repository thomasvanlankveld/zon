import {
  GROUP_SEGMENT,
  isFolder,
  isGroup,
  type Node,
  type Path,
  type SegmentName,
} from "./types.ts";
import { arePathsEqual, getPathString } from "./path.ts";

/**
 * Get a child by its name.
 *
 * If the child is not in its parent's `children`, it will look for it in the parent's "group". This function throws an
 * error if it does not find the child. This function is not recursive, the child has to be a direct child of the
 * parent, or a direct child of the parent's group.
 *
 * @param parent
 * @param childName
 * @param errorPrefix
 * @returns The child
 */
function getChild(
  parent: Node,
  childName: SegmentName,
  errorPrefix: string,
): Node {
  if (!isFolder(parent)) {
    throw new Error(
      `${errorPrefix}: "${getPathString(parent.path)}" is not a folder"`,
    );
  }

  const topLevelMatch = parent.children.find(
    (child) => child.name === childName,
  );

  if (topLevelMatch != null) {
    return topLevelMatch;
  }

  const lastChild = parent.children.at(-1);

  if (lastChild == null) {
    throw new Error(
      `${errorPrefix}: "${getPathString(parent.path)}" has no children`,
    );
  }

  if (!isGroup(lastChild)) {
    throw new Error(
      `${errorPrefix}: "${getPathString(parent.path)}" does not have a child named "${getPathString([childName])}" and it has no grouped children`,
    );
  }

  const groupedChildrenMatch = lastChild.groupedChildren.find(
    (child) => child.name === childName,
  );

  if (groupedChildrenMatch == null) {
    throw new Error(
      `${errorPrefix}: "${getPathString(parent.path)}" has neither a direct child nor a grouped child named "${getPathString([childName])}"`,
    );
  }

  return groupedChildrenMatch;
}

/**
 * Get a node by its path.
 *
 * This function ignores groups unless they are at the end of the path. The root node must contain the entire path. This
 * function throws an error if it can not find the node.
 *
 * @param root
 * @param path
 * @returns The found node
 */
export function getNodeByPath(root: Node, path: Path): Node {
  const errorPrefix = `Can't find node "${getPathString(path)}" in "${getPathString([root.name])}"`;
  let node = root;

  for (let i = 1; i < path.length; i++) {
    const segment = path[i];

    if (segment === GROUP_SEGMENT && i !== path.length - 1) {
      continue;
    }

    if (!isFolder(node)) {
      throw new Error(
        `${errorPrefix}: ${getPathString(node.path)} is not a folder`,
      );
    }

    node = getChild(node, segment, errorPrefix);
  }

  return node;
}

/**
 * Get an array of the nodes along a given path.
 *
 * This function ignores groups unless they are at the end of the path. The root node must contain the entire path. This
 * function throws an error if any of the nodes can not be found.
 *
 * @param root
 * @param path
 * @returns The found node
 */
export function getNodesAlongPath(root: Node, path: Path): Node[] {
  const errorPrefix = `Can't get nodes along path "${getPathString(path)}" in "${getPathString([root.name])}"`;
  let parent = root;

  return path
    .map((segment, i) => {
      if (i === 0) {
        return root;
      }

      if (segment === GROUP_SEGMENT && i !== path.length - 1) {
        return null;
      }

      if (!isFolder(parent)) {
        throw new Error(
          `${errorPrefix}: "${getPathString(parent.path)}" is not a folder"`,
        );
      }

      const match = getChild(parent, segment, errorPrefix);

      parent = match;

      return match;
    })
    .filter((node) => node !== null);
}

type GetDescendantsOptions = {
  exclude?: {
    minLines?: number;
    maxDepth?: number;
  };
};

export function getDescendants(
  node: Node,
  options: GetDescendantsOptions = {},
): Node[] {
  const excludeMinLines = options.exclude?.minLines ?? 0;
  const excludeMaxDepth = options.exclude?.maxDepth ?? Infinity;

  if (node.numberOfLines < excludeMinLines) {
    return [];
  }

  if (node.depth === excludeMaxDepth) {
    return [node];
  }

  if (!isFolder(node)) {
    return [node];
  }

  const childDescendants = node.children.flatMap((child) =>
    getDescendants(child, options),
  );

  return [node, ...childDescendants];
}

/**
 * Returns a copy of `root` with `insertion` inserted at the appropriate path
 * This operation expects all needed folders to already be in place, and it does not recalculate any of the node values
 * @param root The root in which to insert the node
 * @param insertion The node to be inserted
 * @returns Copy of root with insertion
 */
export function withNode(root: Node, insertion: Node): Node {
  const path = insertion.path;

  if (arePathsEqual(root.path, insertion.path)) {
    return insertion;
  }

  if (!isFolder(root)) {
    throw new Error(
      `Can't insert node "${getPathString(path)}" into "${getPathString([root.name])}": ${getPathString(root.path)} is not a folder`,
    );
  }

  const newRoot = { ...root };
  let nextNode: Node = newRoot;

  for (let i = 1; i < path.length; i++) {
    const segment = path[i];

    if (!isFolder(nextNode)) {
      throw new Error(
        `Can't insert node "${getPathString(path)}" into "${getPathString([root.name])}": ${getPathString(nextNode.path)} is not a folder`,
      );
    }

    const matchIndex = nextNode.children.findIndex(
      (child) => child.name === segment,
    );

    if (matchIndex == null) {
      throw new Error(
        `Can't insert node "${getPathString(path)}" into "${getPathString([root.name])}": "${getPathString(nextNode.path)}" does not have a child named "${getPathString([segment])}"`,
      );
    }

    // If we're at the end of the path, insert the insertion, otherwise clone the next node
    const newNode: Node =
      i === path.length - 1 ? insertion : { ...nextNode.children[matchIndex] };

    nextNode.children = nextNode.children.with(matchIndex, newNode);
    nextNode = newNode;
  }

  return newRoot;
}
