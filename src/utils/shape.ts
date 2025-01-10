import { Shape } from "three";

function point(radius: number, angle: number) {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

export type ArcSpecs = {
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
};

/**
 * Return the `d` string for an `svg` path to represent an arc around point `{x: 0, y: 0}`
 * @param arcSpecs
 * @returns
 */
export function getArcShape(arcSpecs: ArcSpecs) {
  const { innerRadius, outerRadius } = arcSpecs;
  const startAngle = 0.5 * Math.PI - arcSpecs.startAngle;
  const endAngle = 0.5 * Math.PI - arcSpecs.endAngle;

  const negativeValues = Object.values(arcSpecs).filter((val) => val < 0);
  if (negativeValues.length > 0) {
    throw new Error(
      `Can't get arc path definition for negative values in ${JSON.stringify(arcSpecs)}`,
    );
  }

  const isCircle = arcSpecs.startAngle === arcSpecs.endAngle % (Math.PI * 2);
  const isOpen = innerRadius > 0;

  if (isCircle && !isOpen) {
    return getClosedCircleArc(outerRadius);
  }

  if (isCircle && isOpen) {
    return getOpenCircleArc(arcSpecs);
  }

  const outerStart = point(outerRadius, startAngle);
  const innerEnd = point(innerRadius, endAngle);

  const arcShape = new Shape();

  arcShape.moveTo(outerStart.x, outerStart.y);
  arcShape.absarc(0, 0, outerRadius, startAngle, endAngle, true);
  arcShape.lineTo(innerEnd.x, innerEnd.y);
  arcShape.absarc(0, 0, innerRadius, endAngle, startAngle, false);
  arcShape.lineTo(outerStart.x, outerStart.y);
  arcShape.closePath();

  return arcShape;
}

function getClosedCircleArc(radius: number) {
  const arcShape = new Shape();

  arcShape.moveTo(radius, 0);
  arcShape.absarc(0, 0, radius, 0, Math.PI);
  arcShape.absarc(0, 0, radius, Math.PI, 2 * Math.PI);

  return arcShape;
}

function getOpenCircleArc(arcSpecs: {
  innerRadius: number;
  outerRadius: number;
}) {
  const outerArcShape = getClosedCircleArc(arcSpecs.outerRadius);
  const innerArcShape = getClosedCircleArc(arcSpecs.innerRadius);

  outerArcShape.holes.push(innerArcShape);

  return outerArcShape;
}
