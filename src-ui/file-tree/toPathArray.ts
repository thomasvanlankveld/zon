import { PathString, PathArray } from './file-tree';

/**
 * Convert path string to array of path segments
 */
export default function toPathArray(pathString: PathString): PathArray {
  return pathString.split('/');
}
