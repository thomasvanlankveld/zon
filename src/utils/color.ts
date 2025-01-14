/**
 * Take a number between 0 and 1 (inclusive), and produce a set of corresponding colors
 * @param value
 */
export function rainbow(value: number) {
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

const radians = Math.PI / 180;

const A = -0.14861,
  B = +1.78277,
  C = -0.29227,
  D = -0.90649,
  E = +1.97294;

// https://people.phy.cam.ac.uk/dag9/CUBEHELIX/
export class Cubehelix {
  private h: number;
  private s: number;
  private l: number;
  private opacity: number;

  constructor(h: number, s: number, l: number, opacity: number) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  toRgb() {
    const h = isNaN(this.h) ? 0 : (this.h + 120) * radians,
      l = +this.l,
      a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
      cosh = Math.cos(h),
      sinh = Math.sin(h);

    return new Rgb(
      255 * (l + a * (A * cosh + B * sinh)),
      255 * (l + a * (C * cosh + D * sinh)),
      255 * (l + a * (E * cosh)),
      this.opacity,
    );
  }

  brighter(k?: number) {
    const newLightness = this.l + (1 - this.l) * (k ?? 0.5);
    return new Cubehelix(this.h, this.s, newLightness, this.opacity);
  }

  darker(k: number) {
    const newLightness = this.l - this.l * (k ?? 0.5);
    return new Cubehelix(this.h, this.s, newLightness, this.opacity);
  }

  clearer(k: number) {
    const newOpacity = this.opacity - this.opacity * (k ?? 0.5);
    return new Cubehelix(this.h, this.s, this.l, newOpacity);
  }

  cloudier(k: number) {
    const newOpacity = this.opacity + this.opacity * (k ?? 0.5);
    return new Cubehelix(this.h, this.s, this.l, newOpacity);
  }

  toRgbString() {
    return this.toRgb().toString();
  }
}

function clampa(opacity: number) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}

function clampi(value: number) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}

export class Rgb {
  private r: number;
  private g: number;
  private b: number;
  private opacity: number;

  constructor(r: number, g: number, b: number, opacity?: number) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +(opacity ?? 1);
  }

  toString() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }
}
