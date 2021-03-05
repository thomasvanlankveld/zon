import { createTree } from './createTree';
import getFolderByPath from './getFolderByPath';
import sortNodes from './sortNodes';

describe('sortNodes', () => {
  it('sorts nodes', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTree([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/quux.ts' },
      { path: 'my-project/src/foo.ts' },
    ]);

    // When I sort the nodes by number of characters in nodeName
    const sorted = sortNodes(tree, (a, b) => {
      if (a.nodeName.length === b.nodeName.length) return 0;
      return a.nodeName.length < b.nodeName.length ? -1 : 1;
    });

    // Then the result is sorted correctly
    expect(getFolderByPath(sorted, 'my-project').children[0].nodeName).toStrictEqual('src');
    expect(getFolderByPath(sorted, 'my-project/src').children[0].nodeName).toStrictEqual('foo.ts');
    expect(getFolderByPath(sorted, 'my-project/src').children[1].nodeName).toStrictEqual('quux.ts');
  });
});
