// From d3 source code: https://github.com/d3/d3-interpolate/blob/2eeffc0d02f2947552cf0a0b73bdf26fe90e1c28/src/basis.js

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

export function interpolateBasis(values: number[]) {
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
