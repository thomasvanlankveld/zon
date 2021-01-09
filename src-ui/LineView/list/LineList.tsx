import React, { FC } from 'react';
import { colorNode } from '../color';
import { LineViewNode } from '../LineViewNode';
import Button from '../../component-lib/Button';
import { useSelectNode } from '../partition';
import formatNumber from '../../component-lib/format/formatNumber';

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

  // Header text and markdown-style underline
  const headerText = `${listRoot.data.filename}: ${formatNumber(listRoot.value || 0)} lines`;
  const headerUnderlineText = Array.from({ length: headerText.length }, () => '=').join('');

  return (
    <div>
      <h4 style={{ color: 'white', marginBottom: 0, fontWeight: 'normal' }}>{headerText}</h4>
      <p style={{ color: 'white', marginTop: 0, marginBottom: '22px' }}>
        {`${headerUnderlineText}`}
      </p>
      <nav aria-label={`${listRoot.data.filename} content list`}>
        {(listRoot.children || []).map((d) => (
          <Button
            key={d.data.path}
            style={{
              color: colorNode(d, { isHighlighted: isHighlighted(d) }),
              cursor: 'pointer',
              display: 'block',
              margin: 0,
            }}
            onClick={(): void => setDiagramRootFilePath(d.data.path)}
            onMouseEnter={(): void => setHoveredListItemFilePath(d.data.path)}
            onMouseLeave={(): void => {
              if (hoveredListItemFilePath === d.data.path) setHoveredListItemFilePath(null);
            }}
          >
            {`${d.data.filename}: ${formatNumber(d.value || 0)} lines`}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default LineList;
