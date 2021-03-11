import { createTree } from './createTree';
import getNodesAlongPath from './getNodesAlongPath';
import getNodeByPath from './getNodeByPath';
import { FileSystemNode, FileSystemNodeType } from './file-tree';
import NodeNotFoundError from './NodeNotFoundError';

describe('getNodesAlongPath', () => {
  it('returns the nodes along a path', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTree([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ]);

    // When I get the nodes along the path "my-project/src/foo.ts"
    const nodes = getNodesAlongPath(tree, 'my-project/src/foo.ts');

    // Then I get these nodes, from root to deepest child
    expect(nodes[0]).toStrictEqual(getNodeByPath(tree, 'my-project'));
    expect(nodes[1]).toStrictEqual(getNodeByPath(tree, 'my-project/src'));
    expect(nodes[2]).toStrictEqual(getNodeByPath(tree, 'my-project/src/foo.ts'));
    expect(nodes).toHaveLength(3);
  });

  it('throws when searching I ask for an incorrect path', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTree([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/', type: FileSystemNodeType.Folder },
    ]);

    // When I call `getNodesAlongPath` with a path beyond a file
    const queryBeyondFile = (): FileSystemNode[] =>
      getNodesAlongPath(tree, 'my-project/package.json/nothing');

    // Then the call throws an exception
    expect(queryBeyondFile).toThrow(
      new NodeNotFoundError(
        'Can\'t find node for path "my-project/package.json/nothing": "my-project/package.json" is not a folder',
        getNodeByPath(tree, 'my-project/package.json'),
        'my-project/package.json/nothing'
      )
    );

    // When I call `getNodesAlongPath` with a path beyond a folder
    const queryBeyondFolder = (): FileSystemNode[] =>
      getNodesAlongPath(tree, 'my-project/src/nothing');

    // Then the call throws an exception
    expect(queryBeyondFolder).toThrow(
      new NodeNotFoundError(
        'Can\'t find node for path "my-project/src/nothing": "my-project/src/" does not have a child "nothing"',
        getNodeByPath(tree, 'my-project/src'),
        'my-project/src/nothing'
      )
    );
  });
});
