import React, { FC } from 'react';
import { colorNode } from '../color';
import Button from '../../component-lib/Button';
import { LineViewNode } from '../LineViewNode';
import { useSelectNode } from '../partition';

interface LineViewBreadcrumbTrailProps {
  projectRoot: LineViewNode;
  path: string;
  isHighlighted: (d: LineViewNode) => boolean;
  setDiagramRootFilePath: (path: string) => void;
}

/**
 *
 */
const LineViewBreadcrumbTrail: FC<LineViewBreadcrumbTrailProps> = function LineViewBreadcrumbTrail(
  props
) {
  const { projectRoot, path, isHighlighted, setDiagramRootFilePath } = props;

  // Get node that is currently visualized (project root if none matches path)
  const currentNode = useSelectNode(projectRoot, path);

  return (
    <nav style={{ marginBottom: '20px' }} aria-label="breadcrumbs">
      {currentNode
        .ancestors()
        .reverse()
        .flatMap((d) => [
          <Button
            style={{
              color: colorNode(d, { isHighlighted: isHighlighted(d) }),
              cursor: 'pointer',
            }}
            key={d.data.path}
            onClick={(): void => setDiagramRootFilePath(d.data.path)}
          >
            <span>{d.data.nodeName}</span>
          </Button>,
          <span style={{ color: 'white' }} key={`${d.data.path}-/`}>
            {' / '}
          </span>,
        ])
        .slice(0, -1)}
    </nav>
  );
};

export default LineViewBreadcrumbTrail;
