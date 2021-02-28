import { zip, partition } from 'lodash';
import isFile from './isFile';
import { FileSystemNode } from './file-tree';
import isFolder from './isFolder';

/**
 * Merges two trees.
 *
 * The second node takes precedence over the first node, similar to how `Object.assign` works. Any keys that are present in both nodes will get the values of the second node. This works recursively: For any child nodes that exist in both trees, children of the second node will overwrite any properties also specified by matching children of the first node.
 *
 * This operation is confluently persistent. Both input nodes remain unmodified. The returned node is a new object, which shares as many child nodes as possibly with the two source nodes.
 */
export default function mergeTrees<FileData extends object, FolderData extends object>(
  first: FileSystemNode<FileData, FolderData>,
  second: FileSystemNode<FileData, FolderData>
): FileSystemNode<FileData, FolderData> {
  // Bail on node type mismatch
  if (first.type !== second.type)
    throw new Error(
      `Failed to merge node with path ${first.path} and type ${first.type} with node with path ${second.path} and type ${second.type}. Types should be the same.`
    );

  // Bail on node path mismatch
  if (first.path !== second.path)
    throw new Error(
      `Failed to merge nodes with paths ${first.path} and ${second.path}. Paths should be the same.`
    );

  // If either node is not a folder, do a simple property merge
  if (isFile(first) && isFile(second))
    return { ...first, ...second, data: { ...first.data, ...second.data } };

  // This check is not necessary at this point, but the compiler doesn't know that
  if (!isFolder(first) || !isFolder(second))
    throw new Error(
      `Failed to merge node with path ${first.path} and type ${first.type} with node with path ${second.path} and type ${second.type}. Types should be the same.`
    );

  // Partition the first node's children into unique and shared
  const [uniqueFirstChildren, sharedFirst] = partition(
    first.children,
    (firstChild) => !second.children.some((secondChild) => firstChild.path === secondChild.path)
  );

  // Partition the second node's children into unique and shared
  const [uniqueSecondChildren, sharedSecond] = partition(
    second.children,
    (secondChild) => !first.children.some((firstChild) => firstChild.path === secondChild.path)
  );

  // Merge the shared children as trees
  const mergedChildren = zip(sharedFirst, sharedSecond).map(([firstChild, secondChild]) => {
    if (firstChild == null || secondChild == null)
      throw new Error(
        `This should never happen: Missing one of these two nodes in array zip: ${firstChild}, ${secondChild}. If you see this, file an issue at: https://github.com/thomasvanlankveld/zon/issues`
      );
    return mergeTrees(firstChild, secondChild);
  });

  // Put all unique and merged children together
  const children = [...uniqueFirstChildren, ...uniqueSecondChildren, ...mergedChildren];

  // Merge folders with children
  return { ...first, ...second, children, data: { ...first.data, ...second.data } };
}
