import asPathArray from './asPathArray';
import { Path, PathString } from './file-tree';
import toPathString from './toPathString';

/**
 * Get the parent path
 */
export default function pathParent(path: Path): PathString {
  const pathArray = asPathArray(path);
  return toPathString(pathArray.slice(0, pathArray.length - 1));
}
