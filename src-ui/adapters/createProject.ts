import { createTreeFromFiles, FolderMapper, mapNodes, MapperPair, sortNodes } from '../file-tree';
import { Project, ProjectNodeData } from '../project/Project';

/**
 * Type of counted data
 */
export interface Counted {
  numberOfLines: number;
}

/**
 * An array of files that have their number of lines counted
 */
export type CountedFiles = { path: string; data: Counted }[];

/**
 * Create a `Project` tree from a list of files that have their number of lines counted
 */
export default function createProject(files: CountedFiles): Project {
  // Construct the file tree
  const root = createTreeFromFiles<Counted>(files);

  // Add number of lines count to folders as well
  const addNumberOfLinesToFolders: FolderMapper<
    Counted,
    {},
    Counted
  > = function addNumberOfLinesToFolders(node) {
    const numberOfLines = node.children.reduce(
      (sum, child) => sum + (child.data as Counted).numberOfLines || 0,
      0
    );
    return { ...node, data: { ...node.data, numberOfLines } };
  };
  const rootWithLineSum = mapNodes(root, {
    folderMapper: addNumberOfLinesToFolders,
  });

  // Sort by number of lines, largest first
  const sortedRoot = sortNodes(
    rootWithLineSum,
    (a, b) => b.data.numberOfLines - a.data.numberOfLines
  );

  // Determine line positions for every node
  let lineNumber = 0;
  const linePositionMappers: MapperPair<Counted, Counted, ProjectNodeData, ProjectNodeData> = {
    fileMapper(node) {
      // Given that files span the entire outer region, we can use an incrementing value to count
      const firstLine = lineNumber;
      const middleLine = lineNumber + node.data.numberOfLines / 2;
      const lastLine = lineNumber + node.data.numberOfLines;
      const nodeColorValue = middleLine / sortedRoot.data.numberOfLines;
      lineNumber += node.data.numberOfLines;
      return { ...node, data: { ...node.data, nodeColorValue, firstLine, middleLine, lastLine } };
    },
    folderMapper(node) {
      // Folders share their first line with the first child
      const firstLine = Math.min(...node.children.map((child) => child.data.firstLine));
      const middleLine = firstLine + node.data.numberOfLines / 2;
      const lastLine = firstLine + node.data.numberOfLines;
      const nodeColorValue = middleLine / sortedRoot.data.numberOfLines;
      return { ...node, data: { ...node.data, nodeColorValue, firstLine, middleLine, lastLine } };
    },
  };
  const rootWithLinePositions = mapNodes(sortedRoot, linePositionMappers);

  return rootWithLinePositions;
}
