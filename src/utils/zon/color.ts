import { arePathsEqual } from "./path";
import type { Colors, Node, Path } from "./types";

/**
 * Take a number between 0 and 1 (inclusive), and produce a set of corresponding colors
 * @param value
 */
export function rainbow(value: number): Colors {
  const position = (value + 0.8) % 1;

  const lightness = 82;
  const chroma = 0.31;
  const hue = position * 360;
  const chromaCorrection = 0.15 + Math.abs(0.5 - ((value + 0.25) % 1));

  return {
    default: `oklch(${lightness}% ${chroma} ${hue})`,
    highlighted: `oklch(${lightness + 10}% ${(1 - chromaCorrection) * chroma} ${hue})`,
    pressed: `oklch(${lightness + 15}% ${(1 - 1.3 * chromaCorrection) * chroma} ${hue})`,
  };
}

/**
 * Get a node's "dynamic" base color. When the node is highlighted (from an outside component), you want to use the
 * "highlight" color instead of the "default" color as its basis.
 */
export function getBaseColor(node: Node, highlightedPath: Path | null): string {
  const isHighlighted = arePathsEqual(highlightedPath, node.path);

  return isHighlighted ? node.colors.highlighted : node.colors.default;
}
