import { HierarchyRectangularNode, interpolateRainbow, lab, scaleLinear } from 'd3';

import { Project } from '../project/Project';

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
 *
 */
export function colorNode(
  node: Project,
  {
    isHighlighted = false,
    isPressed = false,
  }: { isHighlighted?: boolean; isPressed?: boolean } = {}
): string {
  const { baseColor, highlightedColor, pressedColor } = interpolateZon(node.data.nodeColorValue);
  if (isPressed) return pressedColor;
  if (isHighlighted) return highlightedColor;
  return baseColor;
}
