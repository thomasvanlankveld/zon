import { GROUP_SEGMENT, isFolder, type Node, NODE_TYPE } from "./types.ts";
import {
  sumLineTypeCounts as sumLineTypeCounts,
  subtractLineTypeCounts,
} from "./lineType.ts";
import { subtractLanguageCounts, sumLanguageCounts } from "./language.ts";
import { subtractChild, sumCounted } from "./counted.ts";

type GroupOptions = {
  minLines: number;
  maxChildren: number;
  ignoreMinLinesForRoot: boolean;
};

/**
 * Determines the height of a node based on its children
 */
function getHeight(children: Node[]): number {
  return Math.max(...children.map((child) => child.height)) + 1;
}

/**
 * Travels down the root and recursively replaces the smallest nodes with a group of the same size
 * @param node
 * @param options
 * @returns The root node
 */
export function groupSmallestNodes(node: Node, options: GroupOptions): Node {
  if (!isFolder(node)) {
    return node;
  }

  const minLines = options.ignoreMinLinesForRoot ? 0 : options.minLines;

  const visibleChildren = node.children
    .slice(0, options.maxChildren)
    .filter((child) => child.numberOfLines >= minLines)
    .map((child) =>
      groupSmallestNodes(child, { ...options, ignoreMinLinesForRoot: false }),
    );

  if (visibleChildren.length === node.children.length) {
    return {
      ...node,
      children: visibleChildren,
      height: getHeight(visibleChildren),
    };
  }

  const hiddenChildren = node.children.slice(visibleChildren.length);

  // The number of hidden nodes may be much larger than the number of visible ones, so we calculate the hidden line type
  // and language counts by subtracting the visible totals from the parent's total
  // TODO: Pick hidden-first or visible-first strategy based on whether the number of visible children is more or less
  // than half the parent's total number of children
  const visibleCounted = sumCounted(visibleChildren);
  const hiddenCounted = subtractChild(node, visibleCounted);
  const visibleLineTypeCounts = sumLineTypeCounts(
    visibleChildren.map((child) => child.lineTypes),
  );
  const hiddenLineTypeCounts = subtractLineTypeCounts(
    node.lineTypes,
    visibleLineTypeCounts,
    hiddenCounted.colorValue,
  );
  const visibleLanguageCounts = sumLanguageCounts(
    visibleChildren.map((child) => child.languages),
  );
  const hiddenLanguageCounts = subtractLanguageCounts(
    node.languages,
    visibleLanguageCounts,
  );

  const lastVisibleChild = visibleChildren.at(-1);
  const firstHiddenLine =
    lastVisibleChild != null
      ? lastVisibleChild.firstLine + lastVisibleChild.numberOfLines
      : node.firstLine;

  const group: Node = {
    type: NODE_TYPE.GROUP,
    lineTypes: hiddenLineTypeCounts,
    languages: hiddenLanguageCounts,
    path: [...node.path, GROUP_SEGMENT],
    name: GROUP_SEGMENT,
    numberOfLines: hiddenCounted.numberOfLines,
    colorValue: hiddenCounted.colorValue,
    firstLine: firstHiddenLine,
    depth: node.depth + 1,
    height: 0,
    groupedChildren: hiddenChildren,
  };

  const newChildren = [...visibleChildren, group];

  return {
    ...node,
    children: newChildren,
    height: getHeight(newChildren),
  };
}
