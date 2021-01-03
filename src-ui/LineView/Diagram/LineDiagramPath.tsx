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
  hoveredFilePath: string | null;
  setHoveredFilePath: (path: string | null) => void;
  onClick: (path: string) => void;
}

/**
 *
 */
const LineDiagramPath: FC<LineDiagramPathProps> = function LineDiagramPath(props) {
  const { d, isHighlighted, hoveredFilePath, setHoveredFilePath, onClick } = props;

  return (
    <Path
      d={LineDiagramArc(d)}
      datum={d}
      isHighlighted={isHighlighted}
      onMouseEnter={(): void => setHoveredFilePath(d.data.path)}
      onMouseLeave={(): void => {
        if (hoveredFilePath === d.data.path) setHoveredFilePath(null);
      }}
      onClick={(): void => onClick(d.data.path)}
      data-testid={`diagram-path-${d.data.path}`}
    />
  );
};

export default LineDiagramPath;
