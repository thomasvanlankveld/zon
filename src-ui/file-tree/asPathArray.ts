import toPathArray from './toPathArray';
import { Path, PathArray } from './file-tree';

/**
 *
 */
export default function asPathArray(path: Path): PathArray {
  return typeof path === 'string' ? toPathArray(path) : path;
}
