import React, { FC } from 'react';
import { colorNode } from '../color';
import Button from '../../component-lib/Button';
import { Project } from '../../project/Project';
import { getNodesAlongPath } from '../../file-tree';

interface LineViewBreadcrumbTrailProps {
  projectRoot: Project;
  path: string;
  isHighlighted: (node: Project) => boolean;
  setDiagramRootFilePath: (path: string) => void;
}

/**
 *
 */
const LineViewBreadcrumbTrail: FC<LineViewBreadcrumbTrailProps> = function LineViewBreadcrumbTrail(
  props
) {
  const { projectRoot, path, isHighlighted, setDiagramRootFilePath } = props;

  // Get nodes along the current path
  const nodes = getNodesAlongPath(projectRoot, path);

  return (
    <nav style={{ marginBottom: '20px' }} aria-label="breadcrumbs">
      {nodes
        .flatMap((node) => [
          <Button
            style={{
              color: colorNode(node, { isHighlighted: isHighlighted(node) }),
              cursor: 'pointer',
            }}
            key={node.path}
            onClick={(): void => setDiagramRootFilePath(node.path)}
          >
            <span>{node.nodeName}</span>
          </Button>,
          <span style={{ color: 'white' }} key={`${node.path}-/`}>
            {' / '}
          </span>,
        ])
        .slice(0, -1)}
    </nav>
  );
};

export default LineViewBreadcrumbTrail;
