import React, { FC } from 'react';
import LineListItemText from './LineListItemText';
import LineListItem from './LineListItem';
import { Project } from '../../project/Project';
import { getNodeByPath, isFolder } from '../../file-tree';

interface LineListProps {
  projectRoot: Project;
  listRootFilePath: string;
  isHighlighted: (node: Project) => boolean;
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
  const listRoot = getNodeByPath(projectRoot, listRootFilePath);

  const children = isFolder(listRoot) ? listRoot.children : [];

  return (
    <div>
      <h4 style={{ color: 'white', marginBottom: '22px', fontWeight: 'normal', whiteSpace: 'pre' }}>
        <LineListItemText node={listRoot} />
      </h4>
      <nav aria-label={`${listRoot.nodeName} content list`}>
        {children.map((child) => (
          <LineListItem
            key={child.path}
            node={child}
            isHighlighted={isHighlighted(child)}
            onClick={(): void => setDiagramRootFilePath(child.path)}
            onMouseEnter={(): void => setHoveredListItemFilePath(child.path)}
            onMouseLeave={(): void => setHoveredListItemFilePath(null)}
          />
        ))}
      </nav>
    </div>
  );
};

export default LineList;
