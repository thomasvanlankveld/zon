import React, { SFC, useState, useMemo, useCallback } from 'react';
import { HierarchyNode } from 'd3';
import styled from 'styled-components';

import { Project } from '../project/Project';
import zonColoredHierarchy from './color';
import LineViewBreadCrumbs from './LineViewBreadCrumbs';
import LineDiagram from './Diagram/LineDiagram';
import LineList from './LineList';

interface LineViewProps {
  data: Project;
}

/**
 *
 */
const LineViewGrid = styled.div`
  display: grid;
  grid-auto-flow: column;
  column-gap: 20px;
  justify-content: start;
`;

/**
 *
 */
const LineView: SFC<LineViewProps> = function LineView(props) {
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
      <LineViewBreadCrumbs
        projectRoot={projectRoot}
        path={hoveredArcFilePath || diagramRootFilePath}
        isHighlighted={isHighlighted}
        setDiagramRootFilePath={setDiagramRootFilePath}
      />
      <LineViewGrid>
        <LineDiagram
          projectRoot={projectRoot}
          diagramRootFilePath={diagramRootFilePath}
          isHighlighted={isHighlighted}
          hoveredArcFilePath={hoveredArcFilePath}
          setHoveredArcFilePath={setHoveredArcFilePath}
          setDiagramRootFilePath={setDiagramRootFilePath}
        />
        <LineList
          projectRoot={projectRoot}
          listRootFilePath={hoveredArcFilePath || diagramRootFilePath}
          isHighlighted={isHighlighted}
          hoveredListItemFilePath={hoveredListItemFilePath}
          setHoveredListItemFilePath={setHoveredListItemFilePath}
          setDiagramRootFilePath={setDiagramRootFilePath}
        />
      </LineViewGrid>
    </>
  );
};

export default LineView;
