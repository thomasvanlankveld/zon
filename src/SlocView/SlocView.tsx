import React, { SFC, useState } from 'react';
import { pie, arc, interpolateRainbow, DefaultArcObject, scaleLinear } from 'd3';
import styled from 'styled-components';

import { Project, isFolder, ProjectItem } from '../project/Project';

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
const slocPie = pie<ProjectItem>()
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

  // Extract any files
  const files = isFolder(data) ? data.children : [];

  // Color from project item name
  // https://observablehq.com/@d3/working-with-color
  const color = (lineNumber: number): string =>
    interpolateRainbow(scaleLinear().domain([0, root.numberOfLines]).range([0, 1])(lineNumber));

  // Make arcs from the files
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
            key={fileArc.data.filename}
            fill={color(fileArc.data.middleLine)}
            d={slocViewArc(fileArc)}
            // onClick={(): void => setSelectedFileName(fileArc.data.filename)}
            onMouseEnter={(): void => setHoveredFileName(fileArc.data.filename)}
            onMouseLeave={(): void => {
              if (hoveredFileName === fileArc.data.filename) setHoveredFileName(null);
            }}
          />
        ))}
      </svg>
      <h4 style={{ color: 'white' }}>
        <strong>{hoveredFileName || root.filename}</strong>
        {`: ${
          hoveredFileName
            ? files.filter((file) => file.filename === hoveredFileName)[0].numberOfLines
            : root.numberOfLines
        }`}
      </h4>
      {files.map((file) => (
        <p key={file.filename}>
          <Button
            style={{
              color: color(file.middleLine),
              cursor: 'pointer',
              textDecoration: hoveredFileName === file.filename ? 'underline' : 'none',
            }}
            // onClick={(): void => setHoveredFileName(file.filename)}
          >
            <strong>{file.filename}</strong>
            {`: ${file.numberOfLines} lines`}
          </Button>
        </p>
      ))}
    </div>
  );
};

export default SlocView;
