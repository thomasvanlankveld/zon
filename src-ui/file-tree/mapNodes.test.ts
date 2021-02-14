import produce from 'immer';
import { createTreeFromFiles } from './createTreeFromFiles';
import { Mapper, FileMapper, FolderMapper, mapNodes } from './mapNodes';
import getNodeByPath from './getNodeByPath';
import getFileByPath from './getFileByPath';
import getFolderByPath from './getFolderByPath';

describe('mapNodes', () => {
  it('maps nodes given a single mapper', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ]);

    // When I map all nodes to contain the number of characters in their name
    const counted = mapNodes(
      tree,
      produce((draftNode) => {
        draftNode.data.charsInName = draftNode.filename.length;
      }) as Mapper<{}, {}, { charsInName: number }, { charsInName: number }>
    );

    // Then I get the number of characters for every node
    expect(counted.data.charsInName).toStrictEqual(10);
    expect(getNodeByPath(counted, 'my-project/package.json')?.data.charsInName).toStrictEqual(12);
    expect(getNodeByPath(counted, 'my-project/src')?.data.charsInName).toStrictEqual(3);
    expect(getNodeByPath(counted, 'my-project/src/foo.ts')?.data.charsInName).toStrictEqual(6);
    expect(getNodeByPath(counted, 'my-project/src/bar.ts')?.data.charsInName).toStrictEqual(6);
  });

  it('maps nodes given a fileMapper', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ]);

    // When I map all file nodes to contain the number of characters in their name
    const counted = mapNodes(tree, {
      fileMapper: produce((draftNode) => {
        draftNode.data.charsInName = draftNode.filename.length;
      }) as FileMapper<{}, { charsInName: number }>,
    });

    // Then I get the number of characters for every file node
    expect(getFileByPath(counted, 'my-project/package.json').data.charsInName).toStrictEqual(12);
    expect(getFileByPath(counted, 'my-project/src/foo.ts').data.charsInName).toStrictEqual(6);
    expect(getFileByPath(counted, 'my-project/src/bar.ts').data.charsInName).toStrictEqual(6);

    // And I don't get any data for the folder nodes
    expect(counted.data).toStrictEqual({});
    expect(getNodeByPath(counted, 'my-project/src')?.data).toStrictEqual({});
  });

  it('maps nodes given a folderMapper', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ]);

    // When I map all folder nodes to contain the number of characters in their name
    const counted = mapNodes(tree, {
      folderMapper: produce((draftNode) => {
        draftNode.data.charsInName = draftNode.filename.length;
      }) as FolderMapper<{}, {}, {}, { charsInName: number }>,
    });

    // Then I get the number of characters for every folder node
    expect(getFolderByPath(counted, 'my-project').data.charsInName).toStrictEqual(10);
    expect(getFolderByPath(counted, 'my-project/src').data.charsInName).toStrictEqual(3);

    // And I don't get any data for the file nodes
    expect(getFileByPath(counted, 'my-project/package.json').data).toStrictEqual({});
    expect(getFileByPath(counted, 'my-project/src/foo.ts').data).toStrictEqual({});
    expect(getFileByPath(counted, 'my-project/src/bar.ts').data).toStrictEqual({});
  });
  it('maps nodes given two mappers', () => {
    expect.hasAssertions();

    // Given a file tree
    const tree = createTreeFromFiles([
      { path: 'my-project/package.json' },
      { path: 'my-project/src/foo.ts' },
      { path: 'my-project/src/bar.ts' },
    ]);

    // When I map all folder nodes to contain the number of characters in their name, and all file nodes to contain twice that number
    const counted = mapNodes(tree, {
      fileMapper: produce((draftNode) => {
        draftNode.data.charsInName = draftNode.filename.length * 2;
      }) as FileMapper<{}, { charsInName: number }>,
      folderMapper: produce((draftNode) => {
        draftNode.data.charsInName = draftNode.filename.length;
      }) as FolderMapper<{}, {}, { charsInName: number }, { charsInName: number }>,
    });

    // Then I get the number of characters for every folder node
    expect(getFolderByPath(counted, 'my-project').data.charsInName).toStrictEqual(10);
    expect(getFolderByPath(counted, 'my-project/src').data.charsInName).toStrictEqual(3);

    // And I get twice the number of characters for the file nodes
    expect(getFileByPath(counted, 'my-project/package.json').data.charsInName).toStrictEqual(24);
    expect(getFileByPath(counted, 'my-project/src/foo.ts').data.charsInName).toStrictEqual(12);
    expect(getFileByPath(counted, 'my-project/src/bar.ts').data.charsInName).toStrictEqual(12);
  });
});
