import React, { SFC, useState, useMemo, useCallback } from 'react';
import { HierarchyNode } from 'd3';
import styled from 'styled-components';

import { Project } from '../project/Project';
import zonColoredHierarchy from './color';
import SlocViewBreadCrumbs from './SlocViewBreadCrumbs';
import SlocDiagram from './Diagram/SlocDiagram';
import SlocList from './SlocList';

interface SlocViewProps {
  data: Project;
}

/**
 *
 */
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

  // Get hierarchy with colors
  const projectRoot = useMemo(() => zonColoredHierarchy(data), [data]);

  return (
    <>
      <SlocViewBreadCrumbs
        projectRoot={projectRoot}
        path={hoveredArcFilePath}
        isHighlighted={isHighlighted}
        setDiagramRootFilePath={setDiagramRootFilePath}
      />
      <SlocViewGrid>
        <SlocDiagram
          projectRoot={projectRoot}
          diagramRootFilePath={diagramRootFilePath}
          isHighlighted={isHighlighted}
          hoveredArcFilePath={hoveredArcFilePath}
          setHoveredArcFilePath={setHoveredArcFilePath}
          setDiagramRootFilePath={setDiagramRootFilePath}
        />
        <SlocList
          projectRoot={projectRoot}
          listRootFilePath={hoveredArcFilePath}
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
