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
  active: "var(--color-diagram-arc-group-active)",
  deemphasize: "var(--color-diagram-arc-group-deemphasize)",
};

/**
 * Take a number between 0 and 1 (inclusive), and produce a set of corresponding colors
 * @param value
 */
export function rainbow(value: number): Colors {
  const position = (value + 0.8) % 1;

  const lightness = 82;
  const chroma = 0.31;
  const hue = position * 360;

  return {
    regular: `oklch(${lightness}% ${chroma} ${hue})`,
    active: `oklch(${lightness}% ${chroma} ${hue} / 0.8)`,
    deemphasize: `oklch(${lightness}% ${chroma} ${hue} / 0.55)`,
  };
}
