import { LanguageType } from "../tokei";
import { arePathsEqual } from "./path";
import { type Node, type Colors, type Path, isGroup, LINE_TYPE } from "./types";

// TODO: Use safer colors in prod mode (bright colors only in dev mode to emphasize mistakes)
export const NODE_DEFAULT_COLORS: Colors = {
  regular: "var(--color-node-regular)",
  highlight: "var(--color-node-highlight)",
  active: "var(--color-node-active)",
  deemphasize: "var(--color-node-deemphasize)",
};

export const TEXT_ROOT_COLORS: Colors = {
  regular: "var(--color-text-regular)",
  highlight: "var(--color-text-hover-focus)",
  active: "var(--color-text-active)",
  deemphasize: "var(--color-text-deemphasize)",
};

export const DIAGRAM_ROOT_COLORS: Colors = {
  regular: "var(--color-diagram-root-regular)",
  highlight: "var(--color-diagram-root-highlight)",
  active: "var(--color-diagram-root-active)",
  deemphasize: "var(--color-diagram-root-deemphasize)",
};

export const TEXT_GROUP_COLORS: Colors = {
  regular: "var(--color-text-group-regular)",
  highlight: "var(--color-text-group-highlight)",
  active: "var(--color-text-group-active)",
  deemphasize: "var(--color-text-group-deemphasize)",
};

export const DIAGRAM_ARC_GROUP_COLORS: Colors = {
  regular: "var(--color-diagram-arc-group-regular)",
  slightHighlight: "var(--color-diagram-arc-group-slight-highlight)",
  highlight: "var(--color-diagram-arc-group-highlight)",
  active: "var(--color-diagram-arc-group-active)",
  // deemphasize: "rgba(255, 255, 255, 0.5)" // Maybe? (was default value in `Arc.tsx`)
  deemphasize: "var(--color-diagram-arc-group-deemphasize)",
};

function rainbowHue(
  value: number,
  base?: number,
  dynamic?: number,
  offset?: number,
) {
  const position = (value + 0.8) % 1;
  base ??= 0.3;
  // base ??= 0.35;
  dynamic ??= 0.5;
  offset ??= 0.4;

  const hue = position * 360;
  const chromaCorrection = base + Math.abs(dynamic - ((value + offset) % 1));

  return { hue, chromaCorrection };
}

/**
 * Take a number between 0 and 1 (inclusive), and produce a set of corresponding colors
 * @param value
 */
export function rainbow(
  value: number,
  base?: number,
  dynamic?: number,
  offset?: number,
): Colors {
  // const position = (value + 0.8) % 1;
  // base ??= 0.3;
  // // base ??= 0.35;
  // dynamic ??= 0.5;
  // offset ??= 0.4;

  const lightness = 82;
  const chroma = 0.31;
  // const hue = position * 360;
  // const chromaCorrection = base + Math.abs(dynamic - ((value + offset) % 1));
  const { hue, chromaCorrection } = rainbowHue(value, base, dynamic, offset);
  const { hue: oppositeHue, chromaCorrection: oppositeChromaCorrection } =
    rainbowHue(value + 0.5, base, dynamic, offset);

  return {
    regular: `oklch(${lightness}% ${chroma} ${hue})`,
    slightHighlight: `oklch(${lightness + 1}% ${(1 - 0.1 * chromaCorrection) * chroma} ${hue})`,
    // highlight: `oklch(${lightness + 10}% ${chroma} ${hue})`,
    // highlight: `oklch(${lightness}% ${(1 - chromaCorrection) * chroma} ${hue})`,
    // highlight: `oklch(${lightness + 8}% ${(1 - chromaCorrection) * chroma} ${hue})`,
    highlight: `oklch(${lightness + 10}% ${(1 - chromaCorrection) * chroma} ${hue})`,
    // // TODO: Make text use a darker color instead of a lighter one
    // active: `oklch(${lightness + 15}% ${chroma} ${hue})`,
    active: `oklch(${lightness}% ${chroma} ${hue} / 0.8)`,
    // active: `oklch(${lightness + 15}% ${(1 - 1.3 * chromaCorrection) * chroma} ${hue})`,
    opposite: `oklch(${lightness + 10}% ${(1 - oppositeChromaCorrection) * chroma} ${oppositeHue} / 0.5)`,
    // opposite: `oklch(${lightness}% ${chroma} ${oppositeHue})`,
    // deemphasize: `oklch(${lightness}% ${chroma} ${hue} / 0.6)`,
    deemphasize: `oklch(${lightness}% ${chroma} ${hue} / 0.55)`,
    // deemphasize: `oklch(${lightness - 15}% ${chroma} ${hue})`,
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

  return isHighlighted ? colors.highlight : colors.regular;
}

/**
 * Get a node's "static" text colors (not taking into account highlight from an outside component)
 */
export function getNodeStaticTextColors(
  node: Node,
  reportRootPath: Path,
): Colors {
  if (arePathsEqual(node.path, reportRootPath)) {
    return TEXT_ROOT_COLORS;
  }

  if (isGroup(node)) {
    return TEXT_GROUP_COLORS;
  }

  return rainbow(node.colorValue);
}
