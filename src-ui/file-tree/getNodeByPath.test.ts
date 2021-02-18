import { createTreeFromFiles } from './createTreeFromFiles';
import { FileSystemNodeType } from './file-tree';
import getNodeByPath from './getNodeByPath';

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
});
