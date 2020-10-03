import React, { SFC } from 'react';
import { colorNode } from './color';
import { LineViewNode } from './LineViewNode';
import Button from '../component-lib/Button';
import { useSelectNode } from './partition';

interface LineListProps {
  projectRoot: LineViewNode;
  listRootFilePath: string;
  isHighlighted: (d: LineViewNode) => boolean;
  hoveredListItemFilePath: string | null;
  setHoveredListItemFilePath: (path: string | null) => void;
  setDiagramRootFilePath: (path: string) => void;
}

/**
 *
 */
const LineList: SFC<LineListProps> = function LineList(props) {
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
        {`: ${listRoot.value} lines`}
      </h3>
      <nav aria-label={`${listRoot.data.filename} content list`}>
        {(listRoot.children || []).map((d) => (
          <Button
            key={d.data.path}
            style={{
              color: colorNode(d, { isHighlighted: isHighlighted(d) }),
              cursor: 'pointer',
              display: 'block',
              margin: '12px 0',
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
        ))}
      </nav>
    </div>
  );
};

export default LineList;
