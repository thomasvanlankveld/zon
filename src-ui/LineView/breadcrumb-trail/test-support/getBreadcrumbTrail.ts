import { RenderResult } from '@testing-library/react';

/**
 * Get the `HTMLElement` for the nav containing breadcrumbs.
 *
 * @param renderResult Result of calling `render` from `@testing-library/react` on `LineViewBreadcrumbTrail` or any of its parents.
 */
export default function getBreadcrumbTrail(renderResult: RenderResult): HTMLElement {
  const { getByRole } = renderResult;
  return getByRole('navigation', { name: /breadcrumbs/ });
}
