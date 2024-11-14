// Thanks to the d3 authors!
// https://github.com/d3/d3-color
// https://github.com/d3/d3-scale-chromatic

/**
 * Take a number between 0 and 1 (inclusive), and produce the corresponding color along the "less-angry-rainbow" scheme
 * @param t
 */
export function rainbow(t: number) {
  if (t < 0 || t > 1) t -= Math.floor(t);

  const ts = Math.abs(t - 0.5);

  return cubehelix(360 * t - 100, 1.5 - 1.5 * ts, 0.8 - 0.9 * ts)
    .toRgb()
    .toString();
}

const radians = Math.PI / 180;

const A = -0.14861,
  B = +1.78277,
  C = -0.29227,
  D = -0.90649,
  E = +1.97294;

function cubehelix(h: number, s: number, l: number, opacity?: number) {
  return new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
}

class Cubehelix {
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
}

function clampa(opacity: number) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}

function clampi(value: number) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}

class Rgb {
  private r: number;
  private g: number;
  private b: number;
  private opacity: number;

  constructor(r: number, g: number, b: number, opacity: number) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  toString() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }
}
