import toPathArray from './toPathArray';

/**
 * Get the last path segment
 */
export default function pathTip(path: string): string {
  return toPathArray(path).slice(-1)[0];
}
