import createTreeFromFiles from './createTreeFromFiles';
import { reduceNodes } from './reduceNodes';

describe('reduceNodes', () => {
  it('reduces the nodes given a single reducer', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json', data: {} },
      { path: 'my-project/src/foo.ts', data: {} },
      { path: 'my-project/src/bar.ts', data: {} },
    ]);

    // When I reduce it to the number of nodes
    const numberOfNodes = reduceNodes(tree, (total) => total + 1, 0);

    // Then I get the number of nodes
    expect(numberOfNodes).toStrictEqual(5);

    // And I reduce it to the total number of characters in all node names
    const numberOfChars = reduceNodes(tree, (total, node) => total + node.filename.length, 0);

    // Then I get the total number of characters in all node names
    expect(numberOfChars).toStrictEqual(37);
  });

  it('reduces the nodes given a fileReducer', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ]);

    // When I reduce it to the sum of the number of lines
    const sum = reduceNodes(
      tree,
      { fileReducer: (total, node) => total + node.data.numberOfLines },
      0
    );

    // Then I get the number of lines
    expect(sum).toStrictEqual(100);
  });

  it('reduces the nodes given a folderReducer', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json', data: {} },
      { path: 'my-project/src/foo.ts', data: {} },
      { path: 'my-project/src/bar.ts', data: {} },
    ]);

    // When I reduce it to the sum of the number of folders
    const numberOfFolders = reduceNodes(tree, { folderReducer: (total) => total + 1 }, 0);

    // Then I get the number of lines
    expect(numberOfFolders).toStrictEqual(2);
  });

  it('reduces the nodes given two reducers', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ]);

    // When I reduce it to the sum of the number of characters in all folder names, and the sum of the number of lines
    const nodeTotals = reduceNodes(
      tree,
      {
        fileReducer: (totals, node) => {
          const numberOfLines = totals.numberOfLines + node.data.numberOfLines;
          return { ...totals, numberOfLines };
        },
        folderReducer: (totals, node) => {
          const charsInFolderNames = totals.charsInFolderNames + node.filename.length;
          return { ...totals, charsInFolderNames };
        },
      },
      { charsInFolderNames: 0, numberOfLines: 0 }
    );
    const { numberOfLines, charsInFolderNames } = nodeTotals;

    // Then I get correct totals
    expect(numberOfLines).toStrictEqual(100);
    expect(charsInFolderNames).toStrictEqual(13);
  });
});
