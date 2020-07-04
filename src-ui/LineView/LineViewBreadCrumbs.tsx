import React, { SFC } from 'react';
import { colorNode } from './color';
import Button from '../component-lib/Button';
import { LineViewNode } from './LineViewNode';
import { useSelectNode } from './partition';

interface LineViewBreadCrumbsProps {
  projectRoot: LineViewNode;
  path: string;
  isHighlighted: (d: LineViewNode) => boolean;
  setDiagramRootFilePath: (path: string) => void;
}

/**
 *
 */
const LineViewBreadCrumbs: SFC<LineViewBreadCrumbsProps> = function LineViewBreadCrumbs(props) {
  const { projectRoot, path, isHighlighted, setDiagramRootFilePath } = props;

  // Get breadcrumb node (project root if none matches path)
  const breadCrumbNode = useSelectNode(projectRoot, path);

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

export default LineViewBreadCrumbs;
