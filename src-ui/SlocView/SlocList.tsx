import React, { SFC } from 'react';
import { colorNode } from './color';
import { SlocViewNode } from './SlocViewNode';
import Button from '../component-lib/Button';

interface SlocListProps {
  root: SlocViewNode;
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
    root,
    isHighlighted,
    hoveredListItemFilePath,
    setHoveredListItemFilePath,
    setDiagramRootFilePath,
  } = props;

  return (
    <div>
      <h3 style={{ color: 'white' }}>
        <strong>{root.data.filename}</strong>
        {`: ${root.value}`}
      </h3>
      {(root.children || []).map((d) => (
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
