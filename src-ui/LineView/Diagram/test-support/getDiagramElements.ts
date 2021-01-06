import { RenderResult } from '@testing-library/react';
import getDiagram from './getDiagram';
import getDiagramPath from './getDiagramPath';

/**
 * Get the array of elements that should be visible for a given set of paths
 *
 * Example:
 *
 * ```typescript
 * // Given a project
 * const project = createTreeFromFiles([
 *   { path: 'my-project/package.json', data: { numberOfLines: 30 } },
 *   { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
 *   { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
 * ]);
 *
 * // When I render the line view
 * const renderResult = render(<LineView data={project} />);
 *
 * // Then I see the project visualized
 * const diagramElements = getDiagramElements(
 *   'my-project',
 *   [
 *     'my-project/package.json',
 *     'my-project/src',
 *     'my-project/src/foo.ts',
 *     'my-project/src/bar.ts',
 *   ],
 *   renderResult
 * );
 * diagramElements.forEach((element) => expect(element).toBeVisible());
 * ```
 *
 * @param projectName Name of the project
 * @param paths Paths of the files and folders that should be visible
 * @param renderResult Result of calling `render` from `@testing-library/react` on `LineDiagram` or any of its parents.
 */
export default function getDiagramElements(
  projectName: string,
  paths: string[],
  renderResult: RenderResult
): HTMLElement[] {
  return [
    getDiagram(projectName, renderResult),
    ...paths.map((path) => getDiagramPath(path, renderResult)),
  ];
}
