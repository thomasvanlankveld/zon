// TODO: Maybe add a "padding" prop?
// Steal ideas from:
// - https://github.com/thomasvanlankveld/zon/blob/master/src-ui/LineView/Diagram/LineDiagramPath.tsx
// - https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
// - https://observablehq.com/@d3/donut-chart/2

// Example arc:
// `M 0.6, -248.999
// A 249, 249, 0, 0, 1, 95.205, -230.081
// L 63.862, -154.848
// A 167.5, 167.5, 0, 0, 0, 0.6, -167.499Z`;

function point(radius: number, angle: number) {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

type ArcSpecs = {
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
};

// TODO: If circle, do something else
export function arc(arcSpecs: ArcSpecs) {
  const { innerRadius, outerRadius, startAngle, endAngle } = arcSpecs;

  const outerStart = point(outerRadius, startAngle);
  const outerEnd = point(outerRadius, endAngle);
  const innerEnd = point(innerRadius, endAngle);
  const innerStart = point(innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const startCommand = `M ${outerStart.x} ${outerStart.y}`;
  const outerArcCommand = `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`;
  const lineCommand = `L ${innerEnd.x} ${innerEnd.y}`;
  const innerArcCommand = `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`;

  return `${startCommand} ${outerArcCommand} ${lineCommand} ${innerArcCommand} Z`;
}
