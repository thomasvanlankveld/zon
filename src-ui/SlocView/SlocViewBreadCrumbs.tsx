import React, { SFC } from 'react';
import { colorNode } from './color';
import Button from '../component-lib/Button';
import { SlocViewNode } from './SlocViewNode';

interface SlocViewBreadCrumbsProps {
  projectRoot: SlocViewNode;
  path: string;
  isHighlighted: (d: SlocViewNode) => boolean;
  setDiagramRootFilePath: (path: string) => void;
}
/**
 *
 */
const SlocViewBreadCrumbs: SFC<SlocViewBreadCrumbsProps> = function SlocViewBreadCrumbs(props) {
  const { projectRoot, path, isHighlighted, setDiagramRootFilePath } = props;
  // Get breadcrumb node
  const breadCrumbNode = projectRoot.descendants().find((node) => node.data.path === path);
  if (breadCrumbNode == null)
    throw new Error(`No node in ${projectRoot.data.path} with path ${path}`);
  return (
    <div style={{ marginBottom: '20px' }}>
      {breadCrumbNode
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
            <span>{d.data.filename}</span>
          </Button>,
          <span style={{ color: 'white' }} key={`${d.data.path}-/`}>
            {' / '}
          </span>,
        ])
        .slice(0, -1)}
    </div>
  );
};

export default SlocViewBreadCrumbs;
