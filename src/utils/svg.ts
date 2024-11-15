// TODO: Maybe add a "padding" prop?
// Steal ideas from:
// - https://github.com/thomasvanlankveld/zon/blob/master/src-ui/LineView/Diagram/LineDiagramPath.tsx
// - https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
// - https://observablehq.com/@d3/donut-chart/2
// - https://math.stackexchange.com/questions/260096/find-the-coordinates-of-a-point-on-a-circle

// Example arc:
// `M 0.6, -248.999
// A 249, 249, 0, 0, 1, 95.205, -230.081
// L 63.862, -154.848
// A 167.5, 167.5, 0, 0, 0, 0.6, -167.499Z`;

function point(radius: number, angle: number) {
  return {
    x: radius * Math.sin(angle),
    y: radius * Math.cos(angle),
  };
}

export type ArcSpecs = {
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
};

// TODO: If circle, do something else
/**
 * Return the `d` string for an `svg` path to represent an arc around point `{x: 0, y: 0}`
 * @param arcSpecs
 * @returns
 */
export function getArc(arcSpecs: ArcSpecs) {
  const { innerRadius, outerRadius } = arcSpecs;
  const startAngle = Math.PI - arcSpecs.startAngle;
  const endAngle = Math.PI - arcSpecs.endAngle;

  const isCircle = Math.abs(startAngle) === Math.abs(endAngle) % (Math.PI * 2);
  const isOpen = innerRadius > 0;

  if (isCircle && !isOpen) {
    return getClosedCircleArc(outerRadius);
  }

  if (isCircle && isOpen) {
    return getOpenCircleArc(arcSpecs);
  }

  const outerStart = point(outerRadius, startAngle);
  const outerEnd = point(outerRadius, endAngle);
  const innerEnd = point(innerRadius, endAngle);
  const innerStart = point(innerRadius, startAngle);

  const isLarge = startAngle - endAngle >= Math.PI;
  const largeArcFlag = isLarge ? 1 : 0;

  const startCommand = `M ${outerStart.x},${outerStart.y}`;
  const outerArcCommand = `A ${outerRadius},${outerRadius} 0 ${largeArcFlag},1 ${outerEnd.x},${outerEnd.y}`;
  const lineCommand = `L ${innerEnd.x},${innerEnd.y}`;
  const innerArcCommand = `A ${innerRadius},${innerRadius} 0 ${largeArcFlag},0 ${innerStart.x},${innerStart.y}`;

  return `${startCommand} ${outerArcCommand} ${lineCommand} ${innerArcCommand} Z`;
}

function getClosedCircleArc(radius: number) {
  const startCommand = `M ${radius},0`;
  const firstHalf = `A ${radius},${radius} 0 1,1 ${-radius},0`;
  const secondHalf = `A ${radius},${radius} 0 1,1 ${radius},0`;

  return `${startCommand} ${firstHalf} ${secondHalf} Z`;
}

function getOpenCircleArc(arcSpecs: {
  innerRadius: number;
  outerRadius: number;
}) {
  return `${getClosedCircleArc(arcSpecs.outerRadius)} ${getClosedCircleArc(arcSpecs.innerRadius)}`;
}
