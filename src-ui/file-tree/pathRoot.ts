import toPathArray from './toPathArray';

/**
 * Get the first path segment
 */
export default function pathRoot(path: string): string {
  return toPathArray(path)[0];
}
