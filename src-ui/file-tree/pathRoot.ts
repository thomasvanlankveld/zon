import asPathArray from './asPathArray';
import { Path, PathString } from './file-tree';

/**
 * Get the first path segment
 */
export default function pathRoot(path: Path): PathString {
  return asPathArray(path)[0];
}
