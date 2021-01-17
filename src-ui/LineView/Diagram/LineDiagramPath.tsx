import React, { FC } from 'react';
import styled from 'styled-components';
import { arc } from 'd3';

import { colorNode } from '../color';
import { LineViewNode } from '../LineViewNode';
import { width, height } from '../config';

/**
 *
 */
function LineDiagramArc(d: LineViewNode): string | undefined {
  const radius = Math.min(width, height) / 2;
  const padding = 0.005;
  return (
    arc().padRadius(padding)({
      innerRadius: radius * d.y0,
      outerRadius: radius * d.y1,
      startAngle: 2 * Math.PI * d.x0,
      endAngle: 2 * Math.PI * d.x1,
      padAngle: padding,
    }) || undefined
  );
}

interface PathProps {
  datum: LineViewNode;
  isHighlighted: boolean;
}

/**
 *
 */
const Path = styled.path<PathProps>`
  cursor: pointer;
  fill: ${(props): string => {
    const { datum, isHighlighted } = props;
    return colorNode(datum, { isHighlighted });
  }};
  &:active {
    fill: ${(props): string => colorNode(props.datum, { isPressed: true })};
  }
`;

interface LineDiagramPathProps {
  d: LineViewNode;
  isHighlighted: boolean;
  onMouseEnter: (path: string) => void;
  onMouseLeave: (path: string) => void;
  onClick: (path: string) => void;
}

/**
 *
 */
const LineDiagramPath: FC<LineDiagramPathProps> = React.memo(
  function LineDiagramPath(props) {
    const { d, isHighlighted, onMouseEnter, onMouseLeave, onClick } = props;

    return (
      <Path
        d={LineDiagramArc(d)}
        datum={d}
        isHighlighted={isHighlighted}
        onMouseEnter={(): void => onMouseEnter(d.data.path)}
        onMouseLeave={(): void => onMouseLeave(d.data.path)}
        onClick={(): void => onClick(d.data.path)}
        data-testid={`diagram-path-${d.data.path}`}
      />
    );
  },
  function areEqual(firstProps, secondProps): boolean {
    return firstProps.d === secondProps.d && firstProps.isHighlighted === secondProps.isHighlighted;
  }
);

export default LineDiagramPath;
