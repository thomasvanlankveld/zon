import { type Colors } from "./types";

export const TEXT_ROOT_COLORS: Colors = {
  regular: "var(--color-text-regular)",
  active: "var(--color-text-active)",
  deemphasize: "var(--color-text-deemphasize)",
};

export const TEXT_GROUP_COLORS: Colors = {
  regular: "var(--color-text-group-regular)",
  active: "var(--color-text-group-active)",
  deemphasize: "var(--color-text-group-deemphasize)",
};

export const DIAGRAM_ARC_GROUP_COLORS: Colors = {
  regular: "var(--color-diagram-arc-group-regular)",
  slightHighlight: "var(--color-diagram-arc-group-slight-highlight)",
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
    // highlight: `oklch(${lightness + 10}% ${(1 - chromaCorrection) * chroma} ${hue})`,
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
