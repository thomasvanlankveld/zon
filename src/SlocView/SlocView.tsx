import React, { SFC, useRef, useEffect } from 'react';
import { select, pie, arc, interpolateHcl, DefaultArcObject, scaleOrdinal, quantize } from 'd3';

import { Project, File, ProjectItemType } from '../project/Project';

interface SlocViewProps {
  data: Project;
}

const width = 500;
const height = 500;

/**
 *
 */
function slocViewArc(datum: Omit<DefaultArcObject, 'innerRadius' | 'outerRadius'>): string | null {
  const radius = Math.min(width, height) / 2;
  const innerRadius = radius * 0.67;
  const outerRadius = radius - 1;
  return arc()({ innerRadius, outerRadius, ...datum });
}

/**
 *
 */
const slocPie = pie<File>()
  .padAngle(0.005)
  .sort(null)
  .value((d) => d.numberOfLines);

/**
 *
 */
const SlocView: SFC<SlocViewProps> = function SlocView(props) {
  const { data } = props;

  // Get a reference to the svg node, for d3 to render stuff in
  const svgNode = useRef(null);

  // Bail if any of the project items is not a file
  const files = data.content.map((file) => {
    if (file.type !== ProjectItemType.File) {
      throw new Error('SlocView does not support nested files yet');
    }
    return file;
  });

  // Color from project item name
  // const colors = quantize(interpolateHcl('#f4e153', '#362142'), files.length);
  // const colors = quantize(interpolateHcl('#f4e153', '#6c3d8c'), files.length);
  const colors = quantize(interpolateHcl('#f4e153', '#6c3d8c'), files.length);
  const color = scaleOrdinal(colors).domain(files.map((file) => file.name));

  /**
   * Draw a donut
   *
   * Sources:
   *
   * - https://observablehq.com/@d3/donut-chart
   * - https://observablehq.com/@d3/working-with-color?collection=@d3/d3-color
   */
  useEffect(() => {
    // Bail if the node is null
    if (!svgNode.current) return;

    // Select the svg
    const svg = select(svgNode.current).attr(
      'viewBox',
      [-width / 2, -height / 2, width, height].join(' ')
    );

    // Arcs from the files
    const arcs = slocPie(files);

    // Draw the donut
    svg
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', (d) => color(d.data.name))
      .attr('d', slocViewArc)
      .append('title')
      .text((d) => d.data.name);
  }, [svgNode.current, data]);

  return (
    <div>
      <svg ref={svgNode} width={width} height={height} />
      {files.map((file) => (
        <p key={file.name} style={{ color: color(file.name) }}>
          <strong>{file.name}</strong>
          {`: ${file.numberOfLines} lines`}
        </p>
      ))}
    </div>
  );
};

export default SlocView;
