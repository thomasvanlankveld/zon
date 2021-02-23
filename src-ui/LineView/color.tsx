import { HierarchyRectangularNode, interpolateRainbow, lab, scaleLinear } from 'd3';

import { Project } from '../project/Project';
import zonPartition from './partition';

export interface NodeColors {
  baseColor: string;
  highlightedColor: string;
  pressedColor: string;
}

export type ColoredNode<T = object> = HierarchyRectangularNode<T & NodeColors>;

/**
 * Narrows a value from a 0 - 1 domain to a 0.1 - 0.925 range, because values outside this range produce colors that are difficult to see on a dark background.
 */
const scaleForDarkBackground = scaleLinear().range([0.1, 0.925]);

/**
 * Get the color for a node's "color value"
 *
 * @param value A value between 0 and 1, representing the node's position
 */
function interpolateZon(value: number): NodeColors {
  const baseColor = interpolateRainbow(scaleForDarkBackground(value));
  const highlightedColor = lab(baseColor).brighter(0.5).toString();
  const pressedColor = lab(baseColor).brighter(1).toString();
  return { baseColor, highlightedColor, pressedColor };
}

/**
 * Add zon colors to every node in the hierarchy
 */
export default function zonColoredHierarchy<T extends Project>(data: T): ColoredNode<T> {
  // Partition the data
  const root = zonPartition(data);

  // Add color values to each node
  /* eslint-disable no-param-reassign */
  root.each((d) => {
    // A node's colors are based on the node's center within the partition
    const { baseColor, highlightedColor, pressedColor } = interpolateZon(d.x0 + (d.x1 - d.x0) / 2);
    (d as ColoredNode<T>).data.baseColor = baseColor;
    (d as ColoredNode<T>).data.highlightedColor = highlightedColor;
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
