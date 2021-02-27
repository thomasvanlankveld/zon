import asPathArray from './asPathArray';
import { Path, PathString } from './file-tree';

/**
 * Get the last path segment
 */
export default function pathTip(path: Path): PathString {
  return asPathArray(path).slice(-1)[0];
}
