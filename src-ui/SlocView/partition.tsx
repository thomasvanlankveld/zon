import { useMemo } from 'react';
import { hierarchy, partition, HierarchyRectangularNode, HierarchyNode } from 'd3';
import { Project } from '../project/Project';

/**
 *
 */
export default function zonPartition<T extends Project>(data: T): HierarchyRectangularNode<T> {
  // Add hierarchical helper methods and data
  const root = hierarchy(data)
    // Compute the number of lines of every branch as the sum of the number of lines of all its children
    .sum((d) => (d as { data: { numberOfLines: number } }).data.numberOfLines)
    // Sort hierarchy by number of lines, high to low
    .sort((a, b) => (a.value && b.value ? b.value - a.value : 0));

  // Add x0, x1, y0 and y1
  return partition<T>()(root);
}

/**
 *
 */
export function selectNode<T extends HierarchyNode<Project>>(root: T, path: string): T | null {
  const selectedFile = root.descendants().find((file) => file.data.path === path);
  return selectedFile != null ? selectedFile : null;
}

/**
 *
 */
export function useSelectNode<T extends HierarchyNode<Project>>(root: T, path: string): T {
  return useMemo(() => selectNode(root, path) || root, [root, path]);
}
