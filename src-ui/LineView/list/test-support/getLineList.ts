import { RenderResult } from '@testing-library/react';

/**
 * Get the `HTMLElement` for the list
 *
 * @param name Name of the current file or folder
 * @param renderResult Result of calling `render` from `@testing-library/react` on `LineList` or any of its parents.
 */
export default function getLineList(name: string, renderResult: RenderResult): HTMLElement {
  const { getByRole } = renderResult;
  return getByRole('navigation', { name: `${name} content list` });
}
