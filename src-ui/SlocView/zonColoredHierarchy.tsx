import { HierarchyRectangularNode, interpolateRainbow, lab } from 'd3';

import { Project } from '../project/Project';
import zonPartition from './zonPartition';

export interface NodeColors {
  baseColor: string;
  highlightedColor: string;
  pressedColor: string;
}

export type ColoredNode<T = object> = HierarchyRectangularNode<T & NodeColors>;

/**
 *
 */
export default function zonColoredHierarchy<T extends Project>(data: T): ColoredNode<T> {
  // Partition the data
  const root = zonPartition(data);

  // Add color values to each node
  /* eslint-disable no-param-reassign */
  root.each((d) => {
    // The base color is based on the node's center within the partition
    const baseColor = interpolateRainbow(d.x0 + (d.x1 - d.x0) / 2);
    (d as ColoredNode<T>).data.baseColor = baseColor;

    // The highlighted color is a brighter version of the base color
    const highlightedColor = lab(baseColor).brighter(0.5).toString();
    (d as ColoredNode<T>).data.highlightedColor = highlightedColor;

    // The pressed color is an even brighter version of the base color
    const pressedColor = lab(baseColor).brighter(1).toString();
    (d as ColoredNode<T>).data.pressedColor = pressedColor;
  });
  /* eslint-enable no-param-reassign */

  return root as ColoredNode<T>;
}

/**
 *
 */
export function colorNode(
  d: ColoredNode,
  {
    isHighlighted = false,
    isPressed = false,
  }: { isHighlighted?: boolean; isPressed?: boolean } = {}
): string {
  if (isPressed) return d.data.pressedColor;
  if (isHighlighted) return d.data.highlightedColor;
  return d.data.baseColor;
}
