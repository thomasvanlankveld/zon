import { createTreeFromFiles } from './createTreeFromFiles';
import { FileSystemNode, FileSystemNodeType } from './file-tree';
import getNodeByPath from './getNodeByPath';
import NodeNotFoundError from './NodeNotFoundError';

describe('getNodeByPath', () => {
  it('finds a file by its path', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ]);

    // When I call `getNodeByPath` with the path for `foo.ts`
    const node = getNodeByPath(tree, 'my-project/src/foo.ts');

    // Then I get the right node
    expect(node).toStrictEqual({
      data: {},
      nodeName: 'foo.ts',
      path: 'my-project/src/foo.ts',
      type: FileSystemNodeType.File,
    });
  });

  it('finds a folder by its path', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ]);

    // When I call `getNodeByPath` with the path for `src`
    const node = getNodeByPath(tree, 'my-project/src');

    // Then I get the right node
    expect(node).toStrictEqual({
      children: [
        {
          data: {},
          nodeName: 'foo.ts',
          path: 'my-project/src/foo.ts',
          type: FileSystemNodeType.File,
        },
        {
          data: {},
          nodeName: 'bar.ts',
          path: 'my-project/src/bar.ts',
          type: FileSystemNodeType.File,
        },
      ],
      data: {},
      nodeName: 'src',
      path: 'my-project/src',
      type: FileSystemNodeType.Folder,
    });
  });

  it('throws when I ask for a node that is not there', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/' },
    ]);

    // When I call `getNodeByPath` with a path beyond a file
    const queryBeyondFile = (): FileSystemNode =>
      getNodeByPath(tree, 'my-project/package.json/nothing');

    // Then the call throws an exception
    expect(queryBeyondFile).toThrow(
      new NodeNotFoundError(
        `Can't find node for path "my-project/package.json/nothing"`,
        tree,
        'my-project/package.json/nothing'
      )
    );

    // When I call `getNodeByPath` with a path beyond a folder
    const queryBeyondFolder = (): FileSystemNode => getNodeByPath(tree, 'my-project/src/nothing');

    // Then the call throws an exception
    expect(queryBeyondFolder).toThrow(
      new NodeNotFoundError(
        `Can't find node for path "my-project/src/nothing"`,
        tree,
        'my-project/src/nothing'
      )
    );
  });
});
