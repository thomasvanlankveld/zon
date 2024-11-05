import { arc } from "./svg";

function DonutSegment(d: string) {
  return (
    <path
      d={d}
      fill="#98abc5"
      stroke="black"
      style="stroke-width: 2px; opacity: 0.7;"
    ></path>
  );
}

type Slice = {
  startAngle: number;
  endAngle: number;
};

export default function Donut() {
  const width = 500;
  const height = 500;
  const outerRadius = Math.min(width, height) / 2;
  const innerRadius = outerRadius / 2;

  const center = {
    x: width / 2,
    y: height / 2,
  };

  const percentages = [0.1, 0.2, 0.3, 0.4];

  const numPercentages = percentages.length;
  const slices: Slice[] = [];

  for (let i = 0; i < numPercentages; i++) {
    const percentage = percentages[i];
    const startAngle = i === 0 ? Math.PI : slices[i - 1].endAngle;
    const endAngle = startAngle + 2 * Math.PI * percentage;

    slices[i] = { startAngle, endAngle };
  }

  const ds = slices.map((slice) => arc({ ...slice, innerRadius, outerRadius }));

  // TODO:
  // - Leave some room for stroke?
  // - Rotate 90 deg
  return (
    <svg width={width} height={height}>
      <g transform={`translate(${center.x},${center.y})`}>
        {ds.map((d) => DonutSegment(d))}
      </g>
    </svg>
  );
}
