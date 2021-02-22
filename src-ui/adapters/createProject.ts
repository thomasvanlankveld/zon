import { createTreeFromFiles, FolderMapper, mapNodes } from '../file-tree';
import { Project } from '../project/Project';

/**
 * Type of counted data
 */
export interface Counted {
  numberOfLines: number;
}

export type CountedFiles = { path: string; data: Counted }[];

/**
 *
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

  return rootWithLineSum;
}
