import React, { SFC } from 'react';
import { SlocViewNode } from '../SlocViewNode';
import SlocViewPath from './SlocViewPath';
import { width, height } from '../config';

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

export default SlocDiagram;
