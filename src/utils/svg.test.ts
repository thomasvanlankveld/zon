import { describe, it, expect } from "vitest";
import { getArcD } from "./svg.ts";

describe("getArc", () => {
  it("returns an arc definition", () => {
    expect(
      getArcD({
        innerRadius: 1,
        outerRadius: 2,
        startAngle: 0.25 * Math.PI,
        endAngle: 0.5 * Math.PI,
      }),
    ).toStrictEqual(
      "M 1.4142135623730951,-1.414213562373095 A 2,2 0 0,1 2,1.2246467991473532e-16 L 1,6.123233995736766e-17 A 1,1 0 0,0 0.7071067811865476,-0.7071067811865475 Z",
    );
  });
});
