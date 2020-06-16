import React, { SFC, useMemo } from 'react';
import { HierarchyNode } from 'd3';

import { SlocViewNode, ColoredProject } from '../SlocViewNode';
import SlocViewPath from './SlocViewPath';
import { width, height } from '../config';
import zonPartition, { selectNodeByPath } from '../partition';

interface SlocDiagramProps {
  root: SlocViewNode;
  diagramRootFilePath: string;
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
    diagramRootFilePath,
    isHighlighted,
    hoveredArcFilePath,
    setHoveredArcFilePath,
    setDiagramRootFilePath,
  } = props;

  // Select root node for the diagram (either root or the selected file)
  const { diagramRoot, diagramRootParentPath } = useMemo(() => {
    // Get the diagram root
    const unpartitionedDiagramRoot = ((): HierarchyNode<ColoredProject> => {
      const selectedFile = selectNodeByPath(root.descendants(), diagramRootFilePath);
      if (!selectedFile) return root;
      return selectedFile;
    })();

    // Get the path to the parent of the diagram root
    const parentPath = unpartitionedDiagramRoot.parent?.data.path || root.data.path;

    // Repartition the data so the diagram root spans 360 degrees
    const partitionedDiagramRoot = zonPartition(unpartitionedDiagramRoot.data);

    // Return data
    return { diagramRoot: partitionedDiagramRoot, diagramRootParentPath: parentPath };
  }, [root, diagramRootFilePath]);

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
    <svg width={width} height={height} viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}>
      {diagramRoot
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

export default SlocDiagram;
