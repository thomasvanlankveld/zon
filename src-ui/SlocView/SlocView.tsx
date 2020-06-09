import React, { SFC, useState, useMemo, useCallback } from 'react';
import { arc, HierarchyRectangularNode, HierarchyNode } from 'd3';
import styled from 'styled-components';

import { Project } from '../project/Project';
import zonPartition from './zonPartition';
import zonColoredHierarchy, { NodeColors, colorNode } from './zonColoredHierarchy';

interface SlocViewProps {
  data: Project;
}

type ColoredProject = Project & NodeColors;

type SlocViewNode = HierarchyRectangularNode<ColoredProject>;

const width = 500;
const height = 500;

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

interface SlocViewBreadCrumbsProps {
  projectRoot: SlocViewNode;
  path: string;
  isHighlighted: (d: SlocViewNode) => boolean;
  setDiagramRootFilePath: (path: string) => void;
}

/**
 *
 */
const SlocViewBreadCrumbs: SFC<SlocViewBreadCrumbsProps> = function SlocViewBreadCrumbs(props) {
  const { projectRoot, path, isHighlighted, setDiagramRootFilePath } = props;

  // Get breadcrumb node
  const breadCrumbNode = projectRoot.descendants().find((node) => node.data.path === path);
  if (breadCrumbNode == null)
    throw new Error(`No node in ${projectRoot.data.path} with path ${path}`);

  return (
    <div style={{ marginBottom: '20px' }}>
      {breadCrumbNode
        .ancestors()
        .reverse()
        .flatMap((d) => [
          <Button
            style={{
              color: colorNode(d, { isHighlighted: isHighlighted(d) }),
              cursor: 'pointer',
            }}
            key={d.data.path}
            onClick={(): void => setDiagramRootFilePath(d.data.path)}
          >
            <span>{d.data.filename}</span>
          </Button>,
          <span style={{ color: 'white' }} key={`${d.data.path}-/`}>
            {' / '}
          </span>,
        ])
        .slice(0, -1)}
    </div>
  );
};

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

interface PathProps {
  datum: SlocViewNode;
  isHighlighted: boolean;
}

/**
 *
 */
const Path = styled.path<PathProps>`
  cursor: pointer;
  fill: ${(props): string => {
    const { datum, isHighlighted } = props;
    return colorNode(datum, { isHighlighted });
  }};
  &:active {
    fill: ${(props): string => colorNode(props.datum, { isPressed: true })};
  }
`;

interface SlocViewPathProps {
  d: SlocViewNode;
  isHighlighted: boolean;
  hoveredFilePath: string | null;
  setHoveredFilePath: (path: string | null) => void;
  onClick: (path: string) => void;
}

/**
 *
 */
const SlocViewPath: SFC<SlocViewPathProps> = function SlocViewPath(props) {
  const { d, isHighlighted, hoveredFilePath, setHoveredFilePath, onClick } = props;

  return (
    <Path
      d={slocViewArc(d)}
      datum={d}
      isHighlighted={isHighlighted}
      onMouseEnter={(): void => setHoveredFilePath(d.data.path)}
      onMouseLeave={(): void => {
        if (hoveredFilePath === d.data.path) setHoveredFilePath(null);
      }}
      onClick={(): void => onClick(d.data.path)}
    />
  );
};

interface SlocDiagramProps {
  root: SlocViewNode;
  rootParentPath: string;
  isHighlighted: (d: SlocViewNode) => boolean;
  hoveredArcFilePath: string | null;
  setHoveredArcFilePath: (path: string | null) => void;
  setDiagramRootFilePath: (path: string) => void;
}

/**
 *
 */
const SlocDiagram: SFC<SlocDiagramProps> = function SlocDiagram(props) {
  const {
    root,
    rootParentPath,
    isHighlighted,
    hoveredArcFilePath,
    setHoveredArcFilePath,
    setDiagramRootFilePath,
  } = props;

  // Use the path of the clicked item to navigate up or down
  function navigateFromPathClick(path: string): void {
    // If the root arc was clicked, move up to the parent node
    if (path === root.data.path) {
      setDiagramRootFilePath(rootParentPath);
    } else {
      // Otherwise move to the specified node
      setDiagramRootFilePath(path);
    }
  }

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
            onClick={navigateFromPathClick}
          />
        ))}
    </svg>
  );
};

interface SlocListProps {
  root: SlocViewNode;
  isHighlighted: (d: SlocViewNode) => boolean;
  hoveredListItemFilePath: string | null;
  setHoveredListItemFilePath: (path: string | null) => void;
  setDiagramRootFilePath: (path: string) => void;
}

/**
 *
 */
const SlocList: SFC<SlocListProps> = function SlocList(props) {
  const {
    root,
    isHighlighted,
    hoveredListItemFilePath,
    setHoveredListItemFilePath,
    setDiagramRootFilePath,
  } = props;

  return (
    <div>
      <h3 style={{ color: 'white' }}>
        <strong>{root.data.filename}</strong>
        {`: ${root.value}`}
      </h3>
      {(root.children || []).map((d) => (
        <p key={d.data.path}>
          <Button
            style={{
              color: colorNode(d, { isHighlighted: isHighlighted(d) }),
              cursor: 'pointer',
              // textDecoration: hoveredFileName === d.filename ? 'underline' : 'none',
            }}
            onClick={(): void => setDiagramRootFilePath(d.data.path)}
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

const SlocViewGrid = styled.div`
  display: grid;
  grid-auto-flow: column;
  column-gap: 20px;
  justify-content: start;
`;

/**
 *
 */
const SlocView: SFC<SlocViewProps> = function SlocView(props) {
  const { data } = props;
  const projectRootPath = data.path;

  // Path of the selected file
  const [diagramRootFilePath, setDiagramRootFilePath] = useState<string>(projectRootPath);

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

  // Construct a Zon-specific hierarchy
  const root = useMemo(() => zonColoredHierarchy(data), [data]);

  // Select root node for the diagram (either root or the selected file)
  const { diagramRoot, diagramRootParentPath } = useMemo(() => {
    // Get the diagram root
    const unpartitionedDiagramRoot = ((): HierarchyNode<ColoredProject> => {
      const selectedFile = selectNodeByPath(root.descendants(), diagramRootFilePath);
      if (!selectedFile) return root;
      return selectedFile;
    })();

    // Get the path to the parent of the diagram root
    const parentPath = unpartitionedDiagramRoot.parent?.data.path || projectRootPath;

    // Repartition the data so the diagram root spans 360 degrees
    const partitionedDiagramRoot = zonPartition(unpartitionedDiagramRoot.data);

    // Return data
    return { diagramRoot: partitionedDiagramRoot, diagramRootParentPath: parentPath };
  }, [root, diagramRootFilePath]);

  // Select root node for the list view (either root or the file of the hovered arc)
  const listRoot = useMemo(() => {
    if (!hoveredArcFilePath) return diagramRoot;
    const selectedFile = selectNodeByPath(diagramRoot.descendants(), hoveredArcFilePath);
    if (!selectedFile) return diagramRoot;
    return selectedFile;
  }, [diagramRoot, hoveredArcFilePath]);

  return (
    <>
      <SlocViewBreadCrumbs
        projectRoot={root}
        path={listRoot.data.path}
        isHighlighted={isHighlighted}
        setDiagramRootFilePath={setDiagramRootFilePath}
      />
      <SlocViewGrid>
        <SlocDiagram
          root={diagramRoot}
          rootParentPath={diagramRootParentPath}
          isHighlighted={isHighlighted}
          hoveredArcFilePath={hoveredArcFilePath}
          setHoveredArcFilePath={setHoveredArcFilePath}
          setDiagramRootFilePath={setDiagramRootFilePath}
        />
        <SlocList
          root={listRoot}
          isHighlighted={isHighlighted}
          hoveredListItemFilePath={hoveredListItemFilePath}
          setHoveredListItemFilePath={setHoveredListItemFilePath}
          setDiagramRootFilePath={setDiagramRootFilePath}
        />
      </SlocViewGrid>
    </>
  );
};

export default SlocView;
