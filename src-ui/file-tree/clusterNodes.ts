import { partition } from 'lodash';
import { FileSystemNode, Folder } from './file-tree';
import isFile from './isFile';

/**
 * Takes a node and returns `true` or `false`.
 */
export interface NodePredicate<FileData extends object = {}, FolderData extends object = {}> {
  (node: FileSystemNode<FileData, FolderData>): boolean;
}

/**
 * Creates the folder node that serves as a cluster.
 */
export interface ClusterFactory<FileData extends object = {}, FolderData extends object = {}> {
  (
    parent: Folder<FileData, FolderData>,
    childrenToCluster: FileSystemNode<FileData, FolderData>[]
  ): Folder<FileData, FolderData>;
}

/**
 * Cluster nodes in the tree according to the predicate.
 *
 * Clusters are implemented as folders. They need to be created by a user-supplied factory, so that they have appropriate folder data.
 *
 * Example:
 *
 * ```typescript
 * // Given a file tree
 * const tree = createTree([
 *   { path: 'my-project/package.json' },
 *   { path: 'my-project/src/foo.ts' },
 *   { path: 'my-project/src/bar.ts' },
 * ]);
 *
 * // When I cluster typescript files
 * const isTypeScriptFile: NodePredicate = (node) => node.path.endsWith('.ts');
 * const clusterFactory: ClusterFactory = (parent, childrenToCluster) =>
 *   createFolder(`${parent.path}/{typescript}`, { children: childrenToCluster });
 * const clusteredTree = clusterNodes(tree, isTypeScriptFile, clusterFactory);
 *
 * // Then the typescript files are clustered
 * expect(getFileByPath(clusteredTree, 'my-project/package.json')).toBeDefined();
 * expect(getFileByPath(clusteredTree, 'my-project/src/{typescript}/foo.ts')).toBeDefined();
 * expect(getFileByPath(clusteredTree, 'my-project/src/{typescript}/bar.ts')).toBeDefined();
 * ```
 *
 * Children of clustered nodes are not clustered any further. To achieve this, simply call map `clusterNodes` over `childrenToCluster` in the `clusterFactory`:
 *
 * ```typescript
 * const isTypeScriptFile: NodePredicate = (node) => node.path.endsWith('.ts');
 * const clusterFactory: ClusterFactory = (parent, childrenToCluster) =>
 *   createFolder(`${parent.path}/{typescript}`, {
 *     children: childrenToCluster.map((child) =>
 *       clusterNodes(child, isTypeScriptFile, clusterFactory)
 *     ),
 *   });
 * const clusteredTree = clusterNodes(tree, isTypeScriptFile, clusterFactory);
 * ```
 *
 * @param {FileSystemNode} root Root of the tree to cluster.
 * @param {NodePredicate} predicate Determines per node whether it should be clustered. Returning `true` signals that the node should be clustered, returning `false` signals that it shouldn't.
 * @param {ClusterFactory} clusterFactory Creates the folder node that serves as the cluster.
 */
export default function clusterNodes<FileData extends object, FolderData extends object>(
  root: FileSystemNode<FileData, FolderData>,
  predicate: NodePredicate<FileData, FolderData>,
  clusterFactory: ClusterFactory<FileData, FolderData>
): FileSystemNode<FileData, FolderData> {
  // If the root is a file, nothing to cluster
  if (isFile(root)) return root;

  // Partition children according to the predicate
  const [childrenToCluster, childrenNotToCluster] = partition(root.children, predicate);

  // For all children that are not to be clustered, cluster all their children as well
  const recursedChildren = childrenNotToCluster.map((child) =>
    clusterNodes(child, predicate, clusterFactory)
  );

  // Create cluster if there are children to cluster
  const cluster = childrenToCluster.length > 0 && clusterFactory(root, childrenToCluster);

  // Include cluster into a new set of children, if there is a cluster
  const children = cluster ? [...recursedChildren, cluster] : recursedChildren;

  // Merge new set of children back into the root
  return { ...root, children };
}
