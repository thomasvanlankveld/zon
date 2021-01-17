import React, { FC } from 'react';
import { LineViewNode } from '../LineViewNode';
import { useSelectNode } from '../partition';
import LineListItemText from './LineListItemText';
import LineListItem from './LineListItem';

interface LineListProps {
  projectRoot: LineViewNode;
  listRootFilePath: string;
  isHighlighted: (d: LineViewNode) => boolean;
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
          <LineListItem
            key={d.data.path}
            d={d}
            isHighlighted={isHighlighted(d)}
            onClick={(): void => setDiagramRootFilePath(d.data.path)}
            onMouseEnter={(): void => setHoveredListItemFilePath(d.data.path)}
            onMouseLeave={(): void => setHoveredListItemFilePath(null)}
          />
        ))}
      </nav>
    </div>
  );
};

export default LineList;
