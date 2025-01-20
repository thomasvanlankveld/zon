import { arePathsEqual } from "./path";
import { type Node, type Colors, type Path, isGroup } from "./types";

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
    highlight: `oklch(${lightness + 10}% ${(1 - chromaCorrection) * chroma} ${hue})`,
    // TODO: Make text use a darker color instead of a lighter one
    press: `oklch(${lightness + 15}% ${(1 - 1.3 * chromaCorrection) * chroma} ${hue})`,
  };
}

/**
 * Get a node's "dynamic" base color. When the node is highlight (from an outside component), you want to use the
 * "highlight" color instead of the "default" color as its basis.
 */
export function getBaseColor(
  colors: Colors,
  nodePath: Path,
  highlightedPath: Path | null,
): string {
  const isHighlighted = arePathsEqual(highlightedPath, nodePath);

  return isHighlighted ? colors.highlight : colors.default;
}

/**
 * Get a node's "static" text colors (not taking into account highlight from an outside component)
 */
function getNodeStaticTextColors(node: Node, reportRootPath: Path): Colors {
  if (arePathsEqual(node.path, reportRootPath)) {
    return TEXT_ROOT_COLORS;
  }

  if (isGroup(node)) {
    return GROUP_TEXT_COLORS;
  }

  return node.colors;
}

/**
 * Get a node's text color
 */
export function getNodeTextColors(
  node: Node,
  reportRootPath: Path,
  highlightedPath: Path | null,
) {
  const staticColors = getNodeStaticTextColors(node, reportRootPath);

  return {
    base: getBaseColor(staticColors, node.path, highlightedPath),
    highlight: staticColors.highlight,
    press: staticColors.press,
  };
}

// TODO: Use safer colors in prod mode (bright colors only in dev mode to emphasize mistakes)
export const NODE_DEFAULT_COLORS: Colors = {
  default: "var(--color-node-default)",
  highlight: "var(--color-node-highlight)",
  press: "var(--color-node-press)",
};

export const TEXT_ROOT_COLORS: Colors = {
  default: "var(--color-text-root-default)",
  highlight: "var(--color-text-root-highlight)",
  press: "var(--color-text-root-press)",
};

export const GROUP_TEXT_COLORS: Colors = {
  default: "var(--color-group-default)",
  highlight: "var(--color-group-highlight)",
  press: "var(--color-group-press)",
};

export const GROUP_ARC_COLORS: Colors = {
  default: "var(--color-group-default)",
  highlight: "var(--color-group-highlight)",
  press: "var(--color-group-press)",
};
