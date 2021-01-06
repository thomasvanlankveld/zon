import { RenderResult } from '@testing-library/react';
import getLineList from './getLineList';
import getLineListHeading from './getLineListHeading';
import getLineListItemByName from './getLineListItemByName';

/**
 * Get the array of elements that should be visible for a given folder
 *
 * Example:
 *
 * ```typescript
 *  // Given a project
 *  const project = createTreeFromFiles([
 *    { path: 'my-project/package.json', data: { numberOfLines: 30 } },
 *    { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
 *    { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
 *  ]);
 *
 *  // When I render the line view
 *  const renderResult = render(<LineView data={project} />);
 *
 *  // Then I see a list of the top level folder's contents
 *  const lineListElements = getLineListElements('my-project', ['package.json', 'src'], renderResult);
 *  lineListElements.forEach((element) => expect(element).toBeVisible());
 * ```
 *
 * @param folderName Name of the folder (or file)
 * @param contentNames Names of the files and folders inside the enclosing folder (may include number of lines; eg. 'foo.ts: 50 lines')
 * @param renderResult Result of calling `render` from `@testing-library/react` on `LineList` or any of its parents.
 */
export default function getLineListElements(
  folderName: string,
  contentNames: string[],
  renderResult: RenderResult
): HTMLElement[] {
  return [
    getLineList(folderName, renderResult),
    getLineListHeading(folderName, renderResult),
    ...contentNames.map((name) => getLineListItemByName(name, renderResult)),
  ];
}
