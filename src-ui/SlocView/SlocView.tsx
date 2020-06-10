import React, { SFC, useState, useMemo, useCallback } from 'react';
import { HierarchyNode } from 'd3';
import styled from 'styled-components';

import { Project } from '../project/Project';
import zonPartition from './zonPartition';
import zonColoredHierarchy from './zonColoredHierarchy';
import SlocViewBreadCrumbs from './SlocViewBreadCrumbs';
import { ColoredProject } from './SlocViewNode';
import SlocDiagram from './Diagram/SlocDiagram';
import SlocList from './SlocList';

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
