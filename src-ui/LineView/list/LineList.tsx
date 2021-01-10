import React, { FC } from 'react';
import { colorNode } from '../color';
import { LineViewNode } from '../LineViewNode';
import Button from '../../component-lib/Button';
import { useSelectNode } from '../partition';
import LineListItemText from './LineListItemText';

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
const LineList: FC<LineListProps> = function LineList(props) {
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
      <h4 style={{ color: 'white', marginBottom: '22px', fontWeight: 'normal', whiteSpace: 'pre' }}>
        <LineListItemText node={listRoot} />
      </h4>
      <nav aria-label={`${listRoot.data.filename} content list`}>
        {(listRoot.children || []).map((d) => (
          <Button
            key={d.data.path}
            style={{
              color: colorNode(d, { isHighlighted: isHighlighted(d) }),
              cursor: 'pointer',
              display: 'block',
              margin: 0,
              whiteSpace: 'pre',
            }}
            onClick={(): void => setDiagramRootFilePath(d.data.path)}
            onMouseEnter={(): void => setHoveredListItemFilePath(d.data.path)}
            onMouseLeave={(): void => {
              if (hoveredListItemFilePath === d.data.path) setHoveredListItemFilePath(null);
            }}
          >
            <LineListItemText node={d} />
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default LineList;
