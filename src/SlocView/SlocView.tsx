import React, { SFC, useState } from 'react';
import { pie, arc, interpolateHcl, DefaultArcObject, scaleOrdinal, quantize } from 'd3';
import styled from 'styled-components';

import { Project, File, ProjectItemType } from '../project/Project';

interface SlocViewProps {
  data: Project;
}

const width = 500;
const height = 500;

/**
 *
 */
function slocViewArc(
  datum: Omit<DefaultArcObject, 'innerRadius' | 'outerRadius'>
): string | undefined {
  const radius = Math.min(width, height) / 2;
  const innerRadius = radius * 0.67;
  const outerRadius = radius - 1;
  const result = arc()({ innerRadius, outerRadius, ...datum });
  if (!result) return undefined;
  return result;
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
const Button = styled.button`
  /* Basics */
  padding: 0;
  border: none;
  background-color: transparent;

  /* Change the font styles in all browsers. */
  font: inherit; /* 1 */
  color: inherit;
  line-height: 1.15; /* 1 */

  /* Remove the margin in Firefox and Safari. */
  margin: 0; /* 2 */

  /* Show the overflow in Edge. */
  overflow: visible;

  /* Remove the inheritance of text transform in Firefox. */
  text-transform: none;

  /* Correct the inability to style clickable types in iOS and Safari. */
  -webkit-appearance: button;
`;

/**
 *
 */
const SlocView: SFC<SlocViewProps> = function SlocView(props) {
  const { data } = props;
  const root = data;

  // //
  // const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  //
  const [hoveredFileName, setHoveredFileName] = useState<string | null>(null);

  // Bail if any of the project items is not a file
  const files = data.content.map((file) => {
    if (file.type !== ProjectItemType.File) {
      throw new Error('SlocView does not support nested files yet');
    }
    return file;
  });

  // Color from project item name
  // https://observablehq.com/@d3/working-with-color?collection=@d3/d3-color
  // const colors = quantize(interpolateHcl('#f4e153', '#362142'), files.length);
  // const colors = quantize(interpolateHcl('#f4e153', '#6c3d8c'), files.length);
  const colors = quantize(interpolateHcl('#f4e153', '#6c3d8c'), files.length);
  const color = scaleOrdinal(colors).domain(files.map((file) => file.name));

  const arcs = slocPie(files);

  return (
    <div>
      <svg
        width={width}
        height={height}
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
      >
        {arcs.map((fileArc) => (
          <path
            style={{ cursor: 'pointer' }}
            key={fileArc.data.name}
            fill={color(fileArc.data.name)}
            d={slocViewArc(fileArc)}
            // onClick={(): void => setSelectedFileName(fileArc.data.name)}
            onMouseEnter={(): void => setHoveredFileName(fileArc.data.name)}
            onMouseLeave={(): void => {
              if (hoveredFileName === fileArc.data.name) setHoveredFileName(null);
            }}
          />
        ))}
      </svg>
      <h4 style={{ color: 'white' }}>
        <strong>{hoveredFileName || root.name}</strong>
        {`: ${
          hoveredFileName
            ? files.filter((file) => file.name === hoveredFileName)[0].numberOfLines
            : root.numberOfLines
        }`}
      </h4>
      {files.map((file) => (
        <p key={file.name}>
          <Button
            style={{
              color: color(file.name),
              cursor: 'pointer',
              textDecoration: hoveredFileName === file.name ? 'underline' : 'none',
            }}
            // onClick={(): void => setHoveredFileName(file.name)}
          >
            <strong>{file.name}</strong>
            {`: ${file.numberOfLines} lines`}
          </Button>
        </p>
      ))}
    </div>
  );
};

export default SlocView;
