import React, { FC } from 'react';
import Button from '../../component-lib/Button';
import { colorNode } from '../color';
import { LineViewNode } from '../LineViewNode';
import LineListItemText from './LineListItemText';

interface LineListItemProps {
  d: LineViewNode;
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
    const { d, isHighlighted, onMouseEnter, onMouseLeave, onClick } = props;

    return (
      <Button
        style={{
          color: colorNode(d, { isHighlighted }),
          cursor: 'pointer',
          display: 'block',
          margin: 0,
          whiteSpace: 'pre',
        }}
        onClick={(): void => onClick(d.data.path)}
        onMouseEnter={(): void => onMouseEnter(d.data.path)}
        onMouseLeave={(): void => onMouseLeave(d.data.path)}
      >
        <LineListItemText node={d} />
      </Button>
    );
  },
  function areEqual(firstProps, secondProps): boolean {
    return firstProps.d === secondProps.d && firstProps.isHighlighted === secondProps.isHighlighted;
  }
);

export default LineListItem;
