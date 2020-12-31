import { RenderResult } from '@testing-library/react';
import { PathArray } from '../../../file-tree';

/**
 * Get an array of breadcrumb `HTMLElement`s matching the given path.
 *
 * Will throw a `TestingLibraryElementError` if a breadcrumb can not be found.
 *
 * @param path The array of filesystem path segments to find matching breadcrumbs for
 * @param renderResult Result of calling `render` from `@testing-library/react` on `LineViewBreadcrumbTrail` or any of its parents.
 */
export default function getBreadcrumbsForPath(
  path: PathArray,
  renderResult: RenderResult
): HTMLElement[] {
  const { getByRole } = renderResult;
  return path.map((segment) => getByRole('button', { name: segment }));
}
