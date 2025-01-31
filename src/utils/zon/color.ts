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

// From d3 source code
function basis(t1: number, v0: number, v1: number, v2: number, v3: number) {
  const t2 = t1 * t1,
    t3 = t2 * t1;
  return (
    ((1 - 3 * t1 + 3 * t2 - t3) * v0 +
      (4 - 6 * t2 + 3 * t3) * v1 +
      (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 +
      t3 * v3) /
    6
  );
}

function interpolateBasis(values: number[]) {
  const n = values.length - 1;

  return function (t: number) {
    const i = t <= 0 ? (t = 0) : t >= 1 ? ((t = 1), n - 1) : Math.floor(t * n),
      v1 = values[i],
      v2 = values[i + 1],
      v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
      v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

/**
 * Take a number between 0 and 1 (inclusive), and produce a set of corresponding colors
 * @param value
 */
export function rainbow(value: number): Colors {
  const position = (value + 0.85) % 1;
  // const position = (value + 0.87) % 1;
  // const position = (value + 0.8) % 1;

  // const adjustedPosition = position;
  // const adjustedPosition = interpolateBasis([0, 0.4, 1])(position);
  // const adjustedPosition = interpolateBasis([0, 0.2, 0.4, 0.7, 1])(position);
  // const adjustedPosition = interpolateBasis([
  //   0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 0.85, 1,
  // ])(position);

  // // General correction
  // const adjustedPosition = interpolateBasis([
  //   0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.725, 0.75,
  //   0.85, 0.925, 1,
  // ])(position);

  // // Spread green a bit more
  // const adjustedPosition = interpolateBasis([
  //   0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.37, 0.4, 0.42, 0.5, 0.6, 0.725, 0.75,
  //   0.85, 0.925, 1,
  // ])(position);

  // // Spread blues a bit more
  // const adjustedPosition = interpolateBasis([
  //   0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.37, 0.4, 0.42, 0.52, 0.65, 0.725,
  //   0.75, 0.83, 0.875, 1,
  // ])(position);

  // // Smooth sudden pink jump
  // const adjustedPosition = interpolateBasis([
  //   0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.37, 0.4, 0.42, 0.52, 0.65, 0.725,
  //   0.75, 0.83, 0.92, 1,
  // ])(position);

  // Compresses violet and teal, making more space for green, yellow, and deep orange
  const adjustedPosition = interpolateBasis([
    0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.37, 0.4, 0.42, 0.52, 0.65, 0.725,
    0.75, 0.83, 0.92, 1,
  ])(position);

  // const lightness = 71.4;
  // // const chroma = 0.29;
  // // const chroma = 0.28;
  // const chroma = 0.27;
  // // const chroma = 0.25;
  // // const chroma = 0.16;

  // Orange / pink
  // const orangePinkDip = (_: number) => 0 * _;
  const orangePinkDip = (p: number) =>
    interpolateBasis([0, 0, 0.08, 0, 0])((p + 0.3) % 1);
  // const orangePinkDip = (p: number) =>
  //   interpolateBasis([0, 0, 0.08, 0, 0, 0])((p + 0.2) % 1);

  // Green / teal
  // const greenTealDip = (_: number) => 0 * _;
  const greenTealDip = (p: number) =>
    interpolateBasis([0, 0, 0, 0.07, 0, 0, 0])((p - 0.08) % 1);

  // Sum
  // const chromaDip = (_: number) => 0 * _;
  const chromaDip = (p: number) => Math.max(orangePinkDip(p), greenTealDip(p));

  const lightness = 82;
  // const chroma = 0.25;
  // const chroma = 0.26;
  // const chroma = 0.27;
  // const chroma = 0.28;
  // const chroma = 0.31 - chromaDip((position + 0.2) % 1);
  const chroma = 0.31 - chromaDip(position);
  const hue = adjustedPosition * 360;
  // const hue = position * 360;

  return {
    regular: `oklch(${lightness}% ${chroma} ${hue})`,
    active: `oklch(${lightness}% ${chroma} ${hue} / 0.8)`,
    deemphasize: `oklch(${lightness}% ${chroma} ${hue} / 0.55)`,
  };
}
