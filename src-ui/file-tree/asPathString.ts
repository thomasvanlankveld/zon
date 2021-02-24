import { Path, PathString } from './file-tree';
import toPathString from './toPathString';

/**
 *
 */
export default function asPathString(path: Path): PathString {
  return typeof path === 'string' ? path : toPathString(path);
}
