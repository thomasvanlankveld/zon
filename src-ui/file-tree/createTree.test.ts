import { createTree, NodeDescription } from './createTree';
import { FileSystemNodeType } from './file-tree';
import getFolderByPath from './getFolderByPath';
import getFileByPath from './getFileByPath';
import isFolder from './isFolder';
import { FolderFactory } from './insertNode';

describe('createTree', () => {
  it('creates a tree from a list of folder descriptions with no data', () => {
    expect.hasAssertions();

    // When I call `createTree` with a list of folder descriptions with no data
    const tree = createTree([
      { path: 'my-project/src/foo', type: FileSystemNodeType.Folder },
      { path: 'my-project/src/bar', type: FileSystemNodeType.Folder },
    ]);

    // Then I get a tree matching these descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          children: [
            {
              children: [],
              data: {},
              nodeName: 'foo',
              path: 'my-project/src/foo',
              type: FileSystemNodeType.Folder,
            },
            {
              children: [],
              data: {},
              nodeName: 'bar',
              path: 'my-project/src/bar',
              type: FileSystemNodeType.Folder,
            },
          ],
          data: {},
          nodeName: 'src',
          path: 'my-project/src',
          type: FileSystemNodeType.Folder,
        },
      ],
      data: {},
      nodeName: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });

  it('creates a tree from a list of folder descriptions with data', () => {
    expect.hasAssertions();

    // When I call `createTree` with a list of folder descriptions with a data value
    const tree = createTree(
      [
        { path: 'my-project/foo', type: FileSystemNodeType.Folder, data: { value: 3 } },
        { path: 'my-project/bar', type: FileSystemNodeType.Folder, data: { value: 5 } },
      ],
      // And I add a folder factory that sums `value`s of its child folders
      (plainFolder) => ({
        ...plainFolder,
        data: {
          value: plainFolder.children.reduce((total, child) => {
            if (isFolder(child)) return total + child.data.value;
            return total;
          }, 0),
        },
      })
    );

    // Then the compiler knows `value` is in the folder data
    expect(getFolderByPath(tree, 'my-project').data.value).toStrictEqual(8);

    // And I get a tree matching the descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          children: [],
          data: { value: 5 },
          nodeName: 'bar',
          path: 'my-project/bar',
          type: FileSystemNodeType.Folder,
        },
        {
          children: [],
          data: { value: 3 },
          nodeName: 'foo',
          path: 'my-project/foo',
          type: FileSystemNodeType.Folder,
        },
      ],
      data: { value: 8 },
      nodeName: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });

  it('creates a tree from a list of file descriptions with no data', () => {
    expect.hasAssertions();

    // When I call `createTree` with a list of file descriptions no data
    const tree = createTree([
      { path: 'my-project/package.json', type: FileSystemNodeType.File },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ]);

    // Then I get a tree matching these descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          data: {},
          nodeName: 'package.json',
          path: 'my-project/package.json',
          type: FileSystemNodeType.File,
        },
        {
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
        },
      ],
      data: {},
      nodeName: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });

  it('creates a tree from a list of file descriptions with file data', () => {
    expect.hasAssertions();

    // When I call `createTreeFromFiles` with a list of file descriptions with data
    const tree = createTree([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ]);

    // Then the compiler knows `numberOfLines` is in the file data
    expect(getFileByPath(tree, 'my-project/package.json').data.numberOfLines).toStrictEqual(30);

    // And I get a tree matching the descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          data: {
            numberOfLines: 30,
          },
          nodeName: 'package.json',
          path: 'my-project/package.json',
          type: FileSystemNodeType.File,
        },
        {
          children: [
            {
              data: {
                numberOfLines: 50,
              },
              nodeName: 'foo.ts',
              path: 'my-project/src/foo.ts',
              type: FileSystemNodeType.File,
            },
            {
              data: {
                numberOfLines: 20,
              },
              nodeName: 'bar.ts',
              path: 'my-project/src/bar.ts',
              type: FileSystemNodeType.File,
            },
          ],
          data: {},
          nodeName: 'src',
          path: 'my-project/src',
          type: FileSystemNodeType.Folder,
        },
      ],
      data: {},
      nodeName: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });

  it('creates a tree from a list of file descriptions with file data, and a folder data factory', () => {
    expect.hasAssertions();

    // When I call `createTreeFromFiles` with a list of file descriptions with data
    const descriptions = [
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ];
    // And a factory that adds the total number of lines to each folder
    const folderFactory: FolderFactory<{ numberOfLines: number }, { numberOfLines: number }> = (
      plainFolder
    ) => ({
      ...plainFolder,
      data: {
        numberOfLines: plainFolder.children.reduce(
          (total, child) => total + child.data.numberOfLines,
          0
        ),
      },
    });
    const tree = createTree(descriptions, folderFactory);

    // Then the compiler knows `numberOfLines` is in the file data
    expect(getFileByPath(tree, 'my-project/package.json').data.numberOfLines).toStrictEqual(30);

    // And the compiler knows `numberOfLines` is in the folder data
    expect(getFolderByPath(tree, 'my-project/src').data.numberOfLines).toStrictEqual(70);

    // And I get a tree matching the descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          children: [
            {
              data: {
                numberOfLines: 20,
              },
              nodeName: 'bar.ts',
              path: 'my-project/src/bar.ts',
              type: FileSystemNodeType.File,
            },
            {
              data: {
                numberOfLines: 50,
              },
              nodeName: 'foo.ts',
              path: 'my-project/src/foo.ts',
              type: FileSystemNodeType.File,
            },
          ],
          data: {
            numberOfLines: 70,
          },
          nodeName: 'src',
          path: 'my-project/src',
          type: FileSystemNodeType.Folder,
        },
        {
          data: {
            numberOfLines: 30,
          },
          nodeName: 'package.json',
          path: 'my-project/package.json',
          type: FileSystemNodeType.File,
        },
      ],
      data: {
        numberOfLines: 100,
      },
      nodeName: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });

  it('creates a tree from a list of file descriptions with no data, and a folder data factory', () => {
    expect.hasAssertions();

    // When I call `createTreeFromFiles` with a list of file descriptions with no data
    const descriptions = [
      { path: 'my-project/package.json' },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ];
    // And a factory that counts the number of children for each folder
    const folderFactory: FolderFactory<{}, { numberOfChildren: number }> = (plainFolder) => ({
      ...plainFolder,
      data: { numberOfChildren: plainFolder.children.length },
    });
    const tree = createTree(descriptions, folderFactory);

    // Then the compiler knows `numberOfChildren` is in the folder data
    expect(getFolderByPath(tree, 'my-project/src').data.numberOfChildren).toStrictEqual(2);

    // And I get a tree matching the descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          children: [
            {
              data: {},
              nodeName: 'bar.ts',
              path: 'my-project/src/bar.ts',
              type: FileSystemNodeType.File,
            },
            {
              data: {},
              nodeName: 'foo.ts',
              path: 'my-project/src/foo.ts',
              type: FileSystemNodeType.File,
            },
          ],
          data: {
            numberOfChildren: 2,
          },
          nodeName: 'src',
          path: 'my-project/src',
          type: FileSystemNodeType.Folder,
        },
        {
          data: {},
          nodeName: 'package.json',
          path: 'my-project/package.json',
          type: FileSystemNodeType.File,
        },
      ],
      data: {
        numberOfChildren: 2,
      },
      nodeName: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });

  it('creates a tree from a list of node descriptions with no data', () => {
    expect.hasAssertions();

    // When I call `createTree` with a list of node descriptions with no data
    const tree = createTree([
      { path: 'my-project/package.json' },
      { path: 'my-project/src', type: FileSystemNodeType.Folder },
    ]);

    // Then I get a tree matching the descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          data: {},
          nodeName: 'package.json',
          path: 'my-project/package.json',
          type: FileSystemNodeType.File,
        },
        {
          children: [],
          data: {},
          nodeName: 'src',
          path: 'my-project/src',
          type: FileSystemNodeType.Folder,
        },
      ],
      data: {},
      nodeName: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });

  it('creates a tree from a list of node descriptions with file data', () => {
    expect.hasAssertions();

    // When I call `createTree` with a list of node descriptions with file data
    const tree = createTree([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src', type: FileSystemNodeType.Folder },
    ]);

    // Then the compiler knows `numberOfLines` is in the file data
    expect(getFileByPath(tree, 'my-project/package.json').data.numberOfLines).toStrictEqual(30);

    // And I get a tree matching the descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          data: {
            numberOfLines: 30,
          },
          nodeName: 'package.json',
          path: 'my-project/package.json',
          type: FileSystemNodeType.File,
        },
        {
          children: [],
          data: {},
          nodeName: 'src',
          path: 'my-project/src',
          type: FileSystemNodeType.Folder,
        },
      ],
      data: {},
      nodeName: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });

  it('creates a tree from a list of node descriptions with folder data', () => {
    expect.hasAssertions();

    // When I call `createTree` with a list of node descriptions with folder data
    const descriptions = [
      { path: 'my-project/package.json' },
      { path: 'my-project/src', type: FileSystemNodeType.Folder, data: { numberOfChildren: 0 } },
    ];

    // And a factory that counts the number of children for each folder
    const folderFactory: FolderFactory<{}, { numberOfChildren: number }> = (plainFolder) => ({
      ...plainFolder,
      data: { numberOfChildren: plainFolder.children.length },
    });
    const tree = createTree(descriptions, folderFactory);

    // Then the compiler knows `numberOfChildren` is in the folder data
    expect(getFolderByPath(tree, 'my-project/src').data.numberOfChildren).toStrictEqual(0);

    // And I get a tree matching the descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          children: [],
          data: { numberOfChildren: 0 },
          nodeName: 'src',
          path: 'my-project/src',
          type: FileSystemNodeType.Folder,
        },
        {
          data: {},
          nodeName: 'package.json',
          path: 'my-project/package.json',
          type: FileSystemNodeType.File,
        },
      ],
      data: { numberOfChildren: 2 },
      nodeName: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });

  it('creates a tree from a list of node descriptions with file and folder data', () => {
    expect.hasAssertions();

    // When I call `createTree` with a list of node descriptions with file and folder data
    const descriptions: NodeDescription<
      { numberOfLines: number },
      { numberOfChildren: number }
    >[] = [
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src', type: FileSystemNodeType.Folder, data: { numberOfChildren: 0 } },
    ];

    // And a factory that counts the number of children for each folder
    const folderFactory: FolderFactory<{ numberOfLines: number }, { numberOfChildren: number }> = (
      plainFolder
    ) => ({
      ...plainFolder,
      data: { numberOfChildren: plainFolder.children.length },
    });
    const tree = createTree(descriptions, folderFactory);

    // Then the compiler knows `numberOfLines` is in the file data
    expect(getFileByPath(tree, 'my-project/package.json').data.numberOfLines).toStrictEqual(30);

    // Then the compiler knows `numberOfChildren` is in the folder data
    expect(getFolderByPath(tree, 'my-project/src').data.numberOfChildren).toStrictEqual(0);

    // And I get a tree matching the descriptions
    expect(tree).toStrictEqual({
      children: [
        {
          children: [],
          data: { numberOfChildren: 0 },
          nodeName: 'src',
          path: 'my-project/src',
          type: FileSystemNodeType.Folder,
        },
        {
          data: { numberOfLines: 30 },
          nodeName: 'package.json',
          path: 'my-project/package.json',
          type: FileSystemNodeType.File,
        },
      ],
      data: { numberOfChildren: 2 },
      nodeName: 'my-project',
      path: 'my-project',
      type: FileSystemNodeType.Folder,
    });
  });
});
