import { RenderResult } from '@testing-library/react';
import { asPathArray, Path } from '../../../file-tree';
import getBreadcrumb from './getBreadcrumb';

/**
 * Get an array of breadcrumb `HTMLElement`s matching the given path.
 *
 * Will throw a `TestingLibraryElementError` if a breadcrumb can not be found.
 *
 * @param path The array of filesystem path segments to find matching breadcrumbs for
 * @param renderResult Result of calling `render` from `@testing-library/react` on `LineViewBreadcrumbTrail` or any of its parents.
 */
export default function getBreadcrumbsForPath(
  path: Path,
  renderResult: RenderResult
): HTMLElement[] {
  const pathArray = asPathArray(path);
  return pathArray.map((segment) => getBreadcrumb(segment, renderResult));
}
