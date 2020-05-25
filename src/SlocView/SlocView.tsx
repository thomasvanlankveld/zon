import React, { SFC, useState, useMemo } from 'react';
import {
  pie,
  arc,
  interpolateRainbow,
  DefaultArcObject,
  scaleLinear,
  hierarchy,
  partition,
  HierarchyRectangularNode,
} from 'd3';
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
function zonPartition(data: Project): HierarchyRectangularNode<Project> {
  const root = hierarchy(data)
    .sum((d) => (d as { numberOfLines: number }).numberOfLines)
    .sort((a, b) => (a.value && b.value ? b.value - a.value : 0));
  return partition<Project>()(root);
}

/**
 *
 */
function slocViewArc(d: HierarchyRectangularNode<Project>): string | undefined {
  const radius = Math.min(width, height) / 2;
  const padding = 0.005;
  return (
    arc().padRadius(padding)({
      innerRadius: radius * d.y0,
      outerRadius: radius * d.y1,
      startAngle: 2 * Math.PI * d.x0,
      endAngle: 2 * Math.PI * d.x1,
      padAngle: padding,
    }) || undefined
  );
}

// /**
//  *
//  */
// function slocViewArc(
//   datum: Omit<DefaultArcObject, 'innerRadius' | 'outerRadius'>
// ): string | undefined {
//   const radius = Math.min(width, height) / 2;
//   const innerRadius = radius * 0.67;
//   const outerRadius = radius - 1;
//   const result = arc()({ innerRadius, outerRadius, ...datum });
//   if (!result) return undefined;
//   return result;
// }

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
function selectFileByPath(
  files: HierarchyRectangularNode<Project>[],
  path: string
): HierarchyRectangularNode<Project> | null {
  const selectedFile = files.find((file) => file.data.path === path);
  return selectedFile != null ? selectedFile : null;
}

/**
 *
 */
const SlocView: SFC<SlocViewProps> = function SlocView(props) {
  const { data } = props;
  // const root = data;

  // //
  // const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  //
  const [hoveredFilePath, setHoveredFilePath] = useState<string | null>(null);

  // Get files as array
  const root = zonPartition(data);
  // console.log(root);
  const files = root.descendants();

  // Select the hovered file
  const hoveredFile = useMemo(() => {
    if (!hoveredFilePath) return null;
    return selectFileByPath(files, hoveredFilePath);
  }, [files, hoveredFilePath]);
  // console.log(files);
  // // Extract any files
  // const files = isFolder(data) ? data.children : [];

  // // Color from project item name
  // // https://observablehq.com/@d3/working-with-color
  // const color = (lineNumber: number): string =>
  //   interpolateRainbow(scaleLinear().domain([0, root.numberOfLines]).range([0, 1])(lineNumber));

  // // Make arcs from the files
  // const arcs = slocPie(files);

  return (
    <div>
      {/* {partitioned.descendants().map((datum) => (
        <p key={datum.data.path}>
          {datum.data.path}: {datum.data.numberOfLines}
        </p>
      ))} */}
      <svg
        width={width}
        height={height}
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
      >
        {files
          .filter((d) => d.depth > 0)
          .map((d) => (
            <path
              style={{ cursor: 'pointer' }}
              key={d.data.path}
              fill={interpolateRainbow(d.x0 + (d.x1 - d.x0) / 2)}
              d={slocViewArc(d)}
              onMouseEnter={(): void => setHoveredFilePath(d.data.path)}
              onMouseLeave={(): void => {
                if (hoveredFilePath === d.data.path) setHoveredFilePath(null);
              }}
            />
          ))}
        {/* {arcs.map((fileArc) => (
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
        ))} */}
      </svg>
      <h4 style={{ color: 'white' }}>
        <strong>{hoveredFile != null ? hoveredFile.data.filename : root.data.filename}</strong>
        {`: ${hoveredFile != null ? hoveredFile.value : root.value}`}
      </h4>
      {/* {files.map((file) => (
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
      ))} */}
    </div>
  );
};

export default SlocView;
