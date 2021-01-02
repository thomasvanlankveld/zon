import { RenderResult } from '@testing-library/react';

/**
 * Get the `HTMLElement` for the breadcrumb with the given path segment.
 *
 * @param pathSegment Name of the path segment for which to get the breadcrumb.
 * @param renderResult Result of calling `render` from `@testing-library/react` on `LineViewBreadcrumbTrail` or any of its parents.
 */
export default function getBreadcrumb(
  pathSegment: string,
  renderResult: RenderResult
): HTMLElement {
  const { getByRole } = renderResult;
  return getByRole('button', { name: pathSegment });
}
