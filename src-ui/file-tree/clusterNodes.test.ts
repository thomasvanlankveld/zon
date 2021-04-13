import clusterNodes, { ClusterFactory, NodePredicate } from './clusterNodes';
import { createFolder } from './createFolder';
import { createTree } from './createTree';
import getFileByPath from './getFileByPath';

describe('clusterNodes', () => {
  it('clusters nodes', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTree([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ]);

    // When I cluster typescript files
    const isTypeScriptFile: NodePredicate = (node) => node.path.endsWith('.ts');
    const clusterFactory: ClusterFactory = (parent, childrenToCluster) =>
      createFolder(`${parent.path}/{typescript}`, { children: childrenToCluster });
    const clusteredTree = clusterNodes(tree, isTypeScriptFile, clusterFactory);

    // Then the typescript files are clustered
    expect(getFileByPath(clusteredTree, 'my-project/package.json')).toBeDefined();
    expect(getFileByPath(clusteredTree, 'my-project/src/{typescript}/foo.ts')).toBeDefined();
    expect(getFileByPath(clusteredTree, 'my-project/src/{typescript}/bar.ts')).toBeDefined();
  });

  it('clusters nodes according to parent node data', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTree([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ]);

    // When I cluster the contents of `src`
    const isInSrc: NodePredicate = (_, parent) => parent.path.endsWith('/src');
    const clusterFactory: ClusterFactory = (parent, childrenToCluster) =>
      createFolder(`${parent.path}/{isInSrc}`, { children: childrenToCluster });
    const clusteredTree = clusterNodes(tree, isInSrc, clusterFactory);

    // Then the typescript files are clustered
    expect(getFileByPath(clusteredTree, 'my-project/package.json')).toBeDefined();
    expect(getFileByPath(clusteredTree, 'my-project/src/{isInSrc}/foo.ts')).toBeDefined();
    expect(getFileByPath(clusteredTree, 'my-project/src/{isInSrc}/bar.ts')).toBeDefined();
  });
});
