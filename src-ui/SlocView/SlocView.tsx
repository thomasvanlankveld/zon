import React, { SFC, useState, useMemo, useCallback } from 'react';
import { HierarchyNode } from 'd3';
import styled from 'styled-components';

import { Project } from '../project/Project';
import zonPartition from './zonPartition';
import zonColoredHierarchy, { colorNode } from './zonColoredHierarchy';
import SlocViewBreadCrumbs from './SlocViewBreadCrumbs';
import { SlocViewNode, ColoredProject } from './SlocViewNode';
import Button from '../component-lib/Button';
import SlocDiagram from './Diagram/SlocDiagram';

interface SlocViewProps {
  data: Project;
}

/**
 *
 */
function selectNodeByPath<T extends HierarchyNode<Project>>(files: T[], path: string): T | null {
  const selectedFile = files.find((file) => file.data.path === path);
  return selectedFile != null ? selectedFile : null;
}

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
