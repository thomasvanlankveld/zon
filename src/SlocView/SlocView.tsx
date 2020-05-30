import React, { SFC, useState, useMemo } from 'react';
import { arc, interpolateRainbow, hierarchy, partition, HierarchyRectangularNode, lab } from 'd3';
import styled from 'styled-components';

import { Project } from '../project/Project';

interface SlocViewProps {
  data: Project;
}

type SlocViewNode = HierarchyRectangularNode<Project>;

const width = 500;
const height = 500;

/**
 *
 */
function zonPartition(data: Project): SlocViewNode {
  const root = hierarchy(data)
    .sum((d) => (d as { numberOfLines: number }).numberOfLines)
    .sort((a, b) => (a.value && b.value ? b.value - a.value : 0));
  return partition<Project>()(root);
}

/**
 *
 */
function colorNode(d: SlocViewNode, isHovered = false): string {
  const rainbowValue = interpolateRainbow(d.x0 + (d.x1 - d.x0) / 2);
  if (!isHovered) return rainbowValue;
  return lab(rainbowValue).brighter(1).toString();
}

/**
 *
 */
function slocViewArc(d: SlocViewNode): string | undefined {
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

/**
 *
 */
function selectFileByPath(files: SlocViewNode[], path: string): SlocViewNode | null {
  const selectedFile = files.find((file) => file.data.path === path);
  return selectedFile != null ? selectedFile : null;
}

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

interface SlocViewPathProps {
  d: SlocViewNode;
  isHovered: boolean;
  setHoveredFilePath: (path: string | null) => void;
}

/**
 *
 */
const SlocViewPath: SFC<SlocViewPathProps> = function SlocViewPath(props) {
  const { d, isHovered, setHoveredFilePath } = props;

  return (
    <path
      style={{ cursor: 'pointer' }}
      fill={colorNode(d, isHovered)}
      d={slocViewArc(d)}
      // onClick={(): void => setSelectedFileName(fileArc.data.filename)}
      onMouseEnter={(): void => setHoveredFilePath(d.data.path)}
      onMouseLeave={(): void => {
        if (isHovered) setHoveredFilePath(null);
      }}
    />
  );
};

/**
 *
 */
const SlocView: SFC<SlocViewProps> = function SlocView(props) {
  const { data } = props;

  // //
  // const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Path of the hovered file
  const [hoveredFilePath, setHoveredFilePath] = useState<string | null>(null);

  // Get partitioned file datums as array
  const root = zonPartition(data);
  const files = root.descendants();

  // Select root node for the list view (either root or the hovered file)
  const listRoot = useMemo(() => {
    if (!hoveredFilePath) return root;
    const selectedFile = selectFileByPath(files, hoveredFilePath);
    if (!selectedFile) return root;
    return selectedFile;
  }, [files, hoveredFilePath]);

  return (
    <div>
      <svg
        width={width}
        height={height}
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
      >
        {files
          .filter((d) => d.depth > 0)
          .map((d) => (
            <SlocViewPath
              key={d.data.path}
              d={d}
              isHovered={hoveredFilePath === d.data.path}
              setHoveredFilePath={setHoveredFilePath}
            />
          ))}
      </svg>
      <h4 style={{ color: 'white' }}>
        <strong>{listRoot.data.filename}</strong>
        {`: ${listRoot.value}`}
      </h4>
      {(listRoot.children || []).map((d) => (
        <p key={d.data.path}>
          <Button
            style={{
              color: colorNode(d),
              cursor: 'pointer',
              // textDecoration: hoveredFileName === d.filename ? 'underline' : 'none',
            }}
            // onClick={(): void => setHoveredFileName(file.filename)}
          >
            <strong>{d.data.filename}</strong>
            {`: ${d.value} lines`}
          </Button>
        </p>
      ))}
    </div>
  );
};

export default SlocView;
