import React, { FC, useMemo } from 'react';

import LineDiagramPath from './LineDiagramPath';
import { width, height } from '../config';
import zonPartition from '../partition';
import { Project } from '../../project/Project';
import { getNodeByPath } from '../../file-tree';
import pathParent from '../../file-tree/pathParent';

interface LineDiagramProps {
  projectRoot: Project;
  diagramRootFilePath: string;
  isHighlighted: (node: Project) => boolean;
  setHoveredArcFilePath: (path: string | null) => void;
  setDiagramRootFilePath: (path: string) => void;
}

/**
 *
 */
const LineDiagram: FC<LineDiagramProps> = function LineDiagram(props) {
  const {
    projectRoot,
    diagramRootFilePath,
    isHighlighted,
    setHoveredArcFilePath,
    setDiagramRootFilePath,
  } = props;

  // Select root node for the diagram (either root or the selected file)
  const { diagramRoot, diagramRootParentPath } = useMemo(() => {
    // Get the diagram root
    const unpartitionedDiagramRoot = getNodeByPath(projectRoot, diagramRootFilePath);

    // Get the path to the parent of the diagram root
    const parentPath = pathParent(unpartitionedDiagramRoot.path);

    // Repartition the data so the diagram root spans 360 degrees
    const partitionedDiagramRoot = zonPartition(unpartitionedDiagramRoot);

    // Return data
    return { diagramRoot: partitionedDiagramRoot, diagramRootParentPath: parentPath };
  }, [projectRoot, diagramRootFilePath]);

  // Use the path of the clicked item to navigate up or down
  function navigateFromPathClick(path: string): void {
    // If the root arc was clicked, move up to the parent node
    if (path === diagramRoot.data.path) {
      setDiagramRootFilePath(diagramRootParentPath);
    } else {
      // Otherwise move to the specified node
      setDiagramRootFilePath(path);
    }
  }

  return (
    <svg
      aria-label={`${projectRoot.nodeName} line count diagram`}
      role="img"
      width={width}
      height={height}
      viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
    >
      {diagramRoot
        .descendants()
        // .filter((d) => d.depth > 0)
        .map((d) => (
          <LineDiagramPath
            key={d.data.path}
            d={d}
            isHighlighted={isHighlighted(d.data)}
            onMouseEnter={(path: string): void => setHoveredArcFilePath(path)}
            onMouseLeave={(): void => setHoveredArcFilePath(null)}
            onClick={navigateFromPathClick}
          />
        ))}
    </svg>
  );
};

export default LineDiagram;
