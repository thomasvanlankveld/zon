import React, { FC } from 'react';
import Button from '../../component-lib/Button';
import { Project } from '../../project/Project';
import { colorNode } from '../color';
import LineListItemText from './LineListItemText';

interface LineListItemProps {
  node: Project;
  isHighlighted: boolean;
  onMouseEnter: (path: string) => void;
  onMouseLeave: (path: string) => void;
  onClick: (path: string) => void;
}

/**
 *
 */
const LineListItem: FC<LineListItemProps> = React.memo(
  function LineListItem(props) {
    const { node, isHighlighted, onMouseEnter, onMouseLeave, onClick } = props;

    return (
      <Button
        style={{
          color: colorNode(node, { isHighlighted }),
          cursor: 'pointer',
          display: 'block',
          margin: 0,
          whiteSpace: 'pre',
        }}
        onClick={(): void => onClick(node.path)}
        onMouseEnter={(): void => onMouseEnter(node.path)}
        onMouseLeave={(): void => onMouseLeave(node.path)}
      >
        <LineListItemText node={node} />
      </Button>
    );
  },
  function areEqual(firstProps, secondProps): boolean {
    return (
      firstProps.node === secondProps.node && firstProps.isHighlighted === secondProps.isHighlighted
    );
  }
);

export default LineListItem;
