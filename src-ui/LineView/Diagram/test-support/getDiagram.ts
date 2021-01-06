import { RenderResult } from '@testing-library/react';

/**
 * Get the `HTMLElement` for the diagram
 *
 * @param projectName Name of the project
 * @param renderResult Result of calling `render` from `@testing-library/react` on `LineDiagram` or any of its parents.
 */
export default function getDiagram(projectName: string, renderResult: RenderResult): HTMLElement {
  const { getByRole } = renderResult;
  return getByRole('img', { name: `${projectName} line count diagram` });
}
