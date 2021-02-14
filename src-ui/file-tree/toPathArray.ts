import { PathString, PathArray } from './file-tree';

/**
 * Convert path string to array of path segments
 */
export default function toPathArray(pathString: PathString): PathArray {
  // Split by slash
  const segments = pathString.split('/');

  // If the last segment is empty, drop it (for example: "ends/with/slash/")
  if (segments[segments.length - 1] === '') return segments.slice(0, segments.length - 1);

  // Return array of path segments
  return segments;
}
