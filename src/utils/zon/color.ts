import { interpolateBasis } from "../interpolate";
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
  const position = (value + 0.85) % 1;

  // Compress violet and teal, making more space for green, yellow, and deep orange
  const adjustedPosition = interpolateBasis([
    0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.37, 0.4, 0.42, 0.52, 0.65, 0.725,
    0.75, 0.83, 0.92, 1,
  ])(position);

  // Reduce chroma for colors that would otherwise be strangely bright
  const orangePinkDip = (p: number) =>
    interpolateBasis([0, 0, 0.08, 0, 0])((p + 0.3) % 1);
  const greenTealDip = (p: number) =>
    interpolateBasis([0, 0, 0, 0.07, 0, 0, 0])((p - 0.08) % 1);
  const chromaDip = (p: number) => Math.max(orangePinkDip(p), greenTealDip(p));

  const lightness = 82;
  const fullChroma = 0.31 - chromaDip(position);
  const fullHue = adjustedPosition * 360;

  // 3 decimals is enough
  const chroma = Number(fullChroma.toFixed(3));
  const hue = Number(fullHue.toFixed(3));

  return {
    regular: `oklch(${lightness}% ${chroma} ${hue})`,
    active: `oklch(${lightness}% ${chroma} ${hue} / 0.8)`,
    deemphasize: `oklch(${lightness}% ${chroma} ${hue} / 0.55)`,
  };
}

/**
 * Create a conic gradient for a specified section of the rainbow. `startPosition + span` should not exceed `1`. If you
 * set either of these values, you might want to add a `filter: blur(...)`.
 * @param [options.numberOfColors] Whole positive number, default 20, the number of colors in the gradient
 * @param [options.startPosition] Fraction between 0 and 1, default 0, position along the rainbow's colors
 * @param [options.span] Fraction between 0 and 1, default 1, the distance to span along the rainbow's colors
 * @returns Containing a CSS `conicGradient`, for example to be used as a value for `background`
 */
export function conicGradient(
  options: {
    numberOfColors?: number;
    startPosition?: number;
    span?: number;
  } = {},
) {
  const numberOfColors = options.numberOfColors ?? 20;
  const startPosition = options.startPosition ?? 0;
  const span = options.span ?? 1;

  const step = span / numberOfColors;

  function getPosition(i: number) {
    return startPosition + i * step;
  }

  const colors =
    // Add one so that the first color is the same as the last
    Array.from({ length: numberOfColors + 1 })
      .fill(null)
      .map((_, i) => rainbow(getPosition(i)).regular);

  return `conic-gradient(${colors.join(", ")})`;
}
