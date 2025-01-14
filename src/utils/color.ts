import { Colors } from "./zon";

/**
 * Take a number between 0 and 1 (inclusive), and produce a set of corresponding colors
 * @param value
 */
export function rainbow(value: number): Colors {
  const position = (value + 0.8) % 1;

  const baseLightness = 82;
  const chroma = 0.31;
  const hue = position * 360;
  const chromaCorrection = 0.15 + Math.abs(0.5 - ((value + 0.25) % 1));

  return {
    base: `oklch(${baseLightness}% ${chroma} ${hue})`,
    highlighted: `oklch(${baseLightness + 10}% ${(1 - chromaCorrection) * chroma} ${hue})`,
    pressed: `oklch(${baseLightness + 15}% ${(1 - 1.3 * chromaCorrection) * chroma} ${hue})`,
  };
}
