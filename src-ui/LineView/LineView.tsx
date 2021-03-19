import React, { FC, useState, useCallback } from 'react';
import styled from 'styled-components';

import { Project } from '../project/Project';
import LineViewBreadcrumbTrail from './breadcrumb-trail/LineViewBreadcrumbTrail';
import LineDiagram from './diagram/LineDiagram';
import LineList from './list/LineList';

interface LineViewProps {
  projectRoot: Project;
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
const LineView: FC<LineViewProps> = function LineView(props) {
  const { projectRoot } = props;

  // Path of the selected file
  const [diagramRootFilePath, setDiagramRootFilePath] = useState<string>(projectRoot.path);

  // Path of the file for the hovered arc
  const [hoveredArcFilePath, setHoveredArcFilePath] = useState<string | null>(null);

  // Path of the file for the hovered list item
  const [hoveredListItemFilePath, setHoveredListItemFilePath] = useState<string | null>(null);

  // Whether a node should be highlighted
  const isHighlighted = useCallback(
    function isHighlighted(node: Project): boolean {
      return hoveredArcFilePath === node.path || hoveredListItemFilePath === node.path;
    },
    [hoveredArcFilePath, hoveredListItemFilePath]
  );

  return (
    <>
      <LineViewBreadcrumbTrail
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
          setHoveredArcFilePath={setHoveredArcFilePath}
          setDiagramRootFilePath={setDiagramRootFilePath}
        />
        <LineList
          projectRoot={projectRoot}
          listRootFilePath={hoveredArcFilePath || diagramRootFilePath}
          isHighlighted={isHighlighted}
          setHoveredListItemFilePath={setHoveredListItemFilePath}
          setDiagramRootFilePath={setDiagramRootFilePath}
        />
      </LineViewGrid>
    </>
  );
};

export default LineView;
