import React, { SFC, useState, useMemo, useCallback } from 'react';
import {
  arc,
  interpolateRainbow,
  hierarchy,
  partition,
  HierarchyRectangularNode,
  lab,
  HierarchyNode,
} from 'd3';
import styled from 'styled-components';

import { Project } from '../project/Project';

interface SlocViewProps {
  data: Project;
}

interface NodeColors {
  baseColor: string;
  highlightedColor: string;
  pressedColor: string;
}

type ColoredProject = Project & NodeColors;

type SlocViewNode = HierarchyRectangularNode<ColoredProject>;

const width = 500;
const height = 500;

/**
 *
 */
function zonPartition<T extends Project>(data: T): HierarchyRectangularNode<T> {
  // Add hierarchical helper methods and data
  const root = hierarchy(data)
    // Compute the number of lines of every branch as the sum of the number of lines of all its children
    .sum((d) => (d as { numberOfLines: number }).numberOfLines)
    // Sort hierarchy by number of lines, high to low
    .sort((a, b) => (a.value && b.value ? b.value - a.value : 0));

  // Add x0, x1, y0 and y1
  return partition<T>()(root);
}

/**
 *
 */
function zonColoredPartition(data: Project): SlocViewNode {
  // Partition the data
  const root = zonPartition(data);

  // Add color values to each node
  /* eslint-disable no-param-reassign */
  root.each((d) => {
    // The base color is based on the node's center within the partition
    const baseColor = interpolateRainbow(d.x0 + (d.x1 - d.x0) / 2);
    (d as SlocViewNode).data.baseColor = baseColor;

    // The highlighted color is a brighter version of the base color
    const highlightedColor = lab(baseColor).brighter(0.5).toString();
    (d as SlocViewNode).data.highlightedColor = highlightedColor;

    // The pressed color is an even brighter version of the base color
    const pressedColor = lab(baseColor).brighter(1).toString();
    (d as SlocViewNode).data.pressedColor = pressedColor;
  });
  /* eslint-enable no-param-reassign */

  return root as SlocViewNode;
}

/**
 *
 */
function colorNode(
  d: SlocViewNode,
  {
    isHighlighted = false,
    isPressed = false,
  }: { isHighlighted?: boolean; isPressed?: boolean } = {}
): string {
  if (isPressed) return d.data.pressedColor;
  if (isHighlighted) return d.data.highlightedColor;
  return d.data.baseColor;
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
function selectNodeByPath<T extends HierarchyNode<Project>>(files: T[], path: string): T | null {
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
  isHighlighted: boolean;
  hoveredFilePath: string | null;
  setHoveredFilePath: (path: string | null) => void;
  setDiagramRootFilePath: (path: string) => void;
}

/**
 *
 */
const SlocViewPath: SFC<SlocViewPathProps> = function SlocViewPath(props) {
  const { d, isHighlighted, hoveredFilePath, setHoveredFilePath, setDiagramRootFilePath } = props;

  return (
    <path
      style={{ cursor: 'pointer' }}
      fill={colorNode(d, { isHighlighted })}
      d={slocViewArc(d)}
      onMouseEnter={(): void => {
        console.log(d.data.path);
        setHoveredFilePath(d.data.path);
      }}
      onMouseLeave={(): void => {
        if (hoveredFilePath === d.data.path) setHoveredFilePath(null);
      }}
      onClick={(): void => setDiagramRootFilePath(d.data.path)}
    />
  );
};

interface SlocDiagramProps {
  root: SlocViewNode;
  isHighlighted: (d: SlocViewNode) => boolean;
  hoveredArcFilePath: string | null;
  setHoveredArcFilePath: (path: string | null) => void;
  setDiagramRootFilePath: (path: string) => void;
}

const SlocDiagram: SFC<SlocDiagramProps> = function SlocDiagram(props) {
  const {
    root,
    isHighlighted,
    hoveredArcFilePath,
    setHoveredArcFilePath,
    setDiagramRootFilePath,
  } = props;

  return (
    <svg width={width} height={height} viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}>
      {root
        .descendants()
        // .filter((d) => d.depth > 0)
        .map((d) => (
          <SlocViewPath
            key={d.data.path}
            d={d}
            isHighlighted={isHighlighted(d)}
            hoveredFilePath={hoveredArcFilePath}
            setHoveredFilePath={setHoveredArcFilePath}
            setDiagramRootFilePath={setDiagramRootFilePath}
          />
        ))}
    </svg>
  );
};

/**
 *
 */
const SlocView: SFC<SlocViewProps> = function SlocView(props) {
  const { data } = props;

  // Path of the selected file
  const [diagramRootFilePath, setDiagramRootFilePath] = useState<string | null>(null);

  // Path of the file for the hovered arc
  const [hoveredArcFilePath, setHoveredArcFilePath] = useState<string | null>(null);

  // Path of the file for the hovered list item
  const [hoveredListItemFilePath, setHoveredListItemFilePath] = useState<string | null>(null);

  // Whether a node should be highlighted
  const isHighlighted = useCallback(
    function isHighlighted(d: HierarchyNode<Project>): boolean {
      return hoveredArcFilePath === d.data.path || hoveredListItemFilePath === d.data.path;
    },
    [hoveredArcFilePath, hoveredListItemFilePath]
  );

  // Construct a Zon-specific hierarc
  const root = useMemo(() => zonColoredPartition(data), [data]);
  // const root = useMemo(() => zonPartition(data), [data]);
  // root.each((d) => (d.baseColor = interpolateRainbow()));

  // Select root node for the diagram (either root or the selected file)
  const diagramRoot = useMemo(() => {
    const unpartitionedDiagramRoot = ((): HierarchyNode<ColoredProject> => {
      if (!diagramRootFilePath) return root;
      const selectedFile = selectNodeByPath(root.descendants(), diagramRootFilePath);
      if (!selectedFile) return root;
      return selectedFile;
    })();
    return zonPartition(unpartitionedDiagramRoot.data);
  }, [root, diagramRootFilePath]);

  // Select root node for the list view (either root or the file of the hovered arc)
  const listRoot = useMemo(() => {
    if (!hoveredArcFilePath) return diagramRoot;
    const selectedFile = selectNodeByPath(diagramRoot.descendants(), hoveredArcFilePath);
    if (!selectedFile) return diagramRoot;
    return selectedFile;
  }, [diagramRoot, hoveredArcFilePath]);

  return (
    <div>
      <SlocDiagram
        root={diagramRoot}
        isHighlighted={isHighlighted}
        hoveredArcFilePath={hoveredArcFilePath}
        setHoveredArcFilePath={setHoveredArcFilePath}
        setDiagramRootFilePath={setDiagramRootFilePath}
      />
      <h4 style={{ color: 'white' }}>
        <strong>{listRoot.data.filename}</strong>
        {`: ${listRoot.value}`}
      </h4>
      {(listRoot.children || []).map((d) => (
        <p key={d.data.path}>
          <Button
            style={{
              color: colorNode(d, { isHighlighted: isHighlighted(d) }),
              cursor: 'pointer',
              // textDecoration: hoveredFileName === d.filename ? 'underline' : 'none',
            }}
            // onClick={(): void => setHoveredFileName(file.filename)}
            onMouseEnter={(): void => setHoveredListItemFilePath(d.data.path)}
            onMouseLeave={(): void => {
              if (hoveredListItemFilePath === d.data.path) setHoveredListItemFilePath(null);
            }}
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
