import { RenderResult } from '@testing-library/react';

/**
 * Get the `HTMLElement` for the list item with the given file or folder name
 *
 * @param name Name of the file or folder
 * @param renderResult Result of calling `render` from `@testing-library/react` on `LineList` or any of its parents.
 */
export default function getLineListItemByName(
  name: string,
  renderResult: RenderResult
): HTMLElement {
  const { getByRole } = renderResult;
  return getByRole('button', { name: new RegExp(name) });
}
