import { createTreeFromFiles } from './createTreeFromFiles';
import { FileSystemNodeType } from './file-tree';

describe('createTreeFromFiles', () => {
  it('creates a tree from an array of file descriptions without data', () => {
    expect.hasAssertions();

    // When I call `createTreeFromFiles` with an array of file descriptions without data
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ]);

    // Then I get a tree matching these descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          data: {},
          filename: 'package.json',
          path: 'my-project/package.json',
          type: FileSystemNodeType.File,
        },
        {
          children: [
            {
              data: {},
              filename: 'foo.ts',
              path: 'my-project/src/foo.ts',
              type: FileSystemNodeType.File,
            },
            {
              data: {},
              filename: 'bar.ts',
              path: 'my-project/src/bar.ts',
              type: FileSystemNodeType.File,
            },
          ],
          data: {},
          filename: 'src',
          path: 'my-project/src',
          type: FileSystemNodeType.Folder,
        },
      ],
      data: {},
      filename: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });

  it('creates a tree from an array of file descriptions with data', () => {
    expect.hasAssertions();

    // When I call `createTreeFromFiles` with an array of file descriptions with data
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ]);

    // Then I get a tree matching these descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          data: {
            numberOfLines: 30,
          },
          filename: 'package.json',
          path: 'my-project/package.json',
          type: FileSystemNodeType.File,
        },
        {
          children: [
            {
              data: {
                numberOfLines: 50,
              },
              filename: 'foo.ts',
              path: 'my-project/src/foo.ts',
              type: FileSystemNodeType.File,
            },
            {
              data: {
                numberOfLines: 20,
              },
              filename: 'bar.ts',
              path: 'my-project/src/bar.ts',
              type: FileSystemNodeType.File,
            },
          ],
          data: {},
          filename: 'src',
          path: 'my-project/src',
          type: FileSystemNodeType.Folder,
        },
      ],
      data: {},
      filename: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });
});
