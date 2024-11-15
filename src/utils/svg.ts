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
export function getArc(arcSpecs: ArcSpecs) {
  if (arcSpecs.startAngle === arcSpecs.endAngle % (Math.PI * 2)) {
    return getCircleArc(arcSpecs.outerRadius);
  }

  const { innerRadius, outerRadius } = arcSpecs;
  const startAngle = Math.PI - arcSpecs.startAngle;
  const endAngle = Math.PI - arcSpecs.endAngle;

  const outerStart = point(outerRadius, startAngle);
  const outerEnd = point(outerRadius, endAngle);
  const innerEnd = point(innerRadius, endAngle);
  const innerStart = point(innerRadius, startAngle);

  const isLarge = startAngle - endAngle >= Math.PI;
  const largeArcFlag = isLarge ? 1 : 0;

  const startCommand = `M ${outerStart.x} ${outerStart.y}`;
  const outerArcCommand = `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`;
  const lineCommand = `L ${innerEnd.x} ${innerEnd.y}`;
  const innerArcCommand = `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`;

  return `${startCommand} ${outerArcCommand} ${lineCommand} ${innerArcCommand} Z`;
}

export function getCircleArc(radius: number) {
  const startCommand = `M ${radius} 0`;
  const firstHalf = `A ${radius} ${radius} 0 1 1 ${-radius} 0`;
  const secondHalf = `A ${radius} ${radius} 0 1 1 ${radius} 0`;

  return `${startCommand} ${firstHalf} ${secondHalf} Z`;
}
