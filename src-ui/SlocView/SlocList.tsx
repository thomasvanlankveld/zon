import React, { SFC } from 'react';
import { colorNode } from './color';
import { SlocViewNode } from './SlocViewNode';
import Button from '../component-lib/Button';
import { useSelectNode } from './partition';

interface SlocListProps {
  projectRoot: SlocViewNode;
  listRootFilePath: string;
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
    projectRoot,
    listRootFilePath,
    isHighlighted,
    hoveredListItemFilePath,
    setHoveredListItemFilePath,
    setDiagramRootFilePath,
  } = props;

  // Select root node for the list view (either root or the file of the hovered arc)
  const listRoot = useSelectNode(projectRoot, listRootFilePath);

  return (
    <div>
      <h3 style={{ color: 'white' }}>
        <strong>{listRoot.data.filename}</strong>
        {`: ${listRoot.value}`}
      </h3>
      {(listRoot.children || []).map((d) => (
        <p key={d.data.path}>
          <Button
            style={{
              color: colorNode(d, { isHighlighted: isHighlighted(d) }),
              cursor: 'pointer',
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

export default SlocList;
