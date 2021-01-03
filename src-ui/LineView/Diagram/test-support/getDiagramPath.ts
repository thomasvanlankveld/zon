import { RenderResult } from '@testing-library/react';

/**
 * Get the `HTMLElement` for the diagram arc
 *
 * @param path Path of the file or folder
 * @param renderResult Result of calling `render` from `@testing-library/react` on `LineDiagramPath` or any of its parents.
 */
export default function getDiagramPath(path: string, renderResult: RenderResult): HTMLElement {
  const { getByTestId } = renderResult;
  return getByTestId(`diagram-path-${path}`);
}
