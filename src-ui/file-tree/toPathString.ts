import { PathArray, PathString } from './file-tree';

/**
 * Convert array of path segments to path string
 */
export default function toPathString(pathArray: PathArray): PathString {
  return pathArray.join('/');
}
