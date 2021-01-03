import { RenderResult } from '@testing-library/react';

/**
 * Get the `HTMLElement` for the list heading
 *
 * @param name Name of the current file or folder
 * @param renderResult Result of calling `render` from `@testing-library/react` on `LineList` or any of its parents.
 */
export default function getLineListHeading(name: string, renderResult: RenderResult): HTMLElement {
  const { getByRole } = renderResult;
  return getByRole('heading', { name: new RegExp(name) });
}
