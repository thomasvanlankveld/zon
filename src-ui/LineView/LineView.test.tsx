import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import LineView from './LineView';
import { createTreeFromFiles } from '../file-tree';
import getBreadcrumbTrail from './breadcrumb-trail/test-support/getBreadcrumbTrail';
import getBreadcrumb from './breadcrumb-trail/test-support/getBreadcrumb';
import getLineListItemByName from './list/test-support/getLineListItemByName';

describe('LineView', () => {
  it('renders breadcrumbs, a diagram and a list', () => {
    expect.hasAssertions();

    // Given a project
    const project = createTreeFromFiles([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ]);

    // When I render the line view
    const renderResult = render(<LineView data={project} />);
    const { getByRole } = renderResult;

    // Then I see the breadcrumbs for the project's root
    expect(getBreadcrumbTrail(renderResult)).toHaveTextContent('my-project');
    expect(getBreadcrumb('my-project', renderResult)).toBeVisible();

    // And I see the project visualized
    expect(getByRole('img', { name: 'my-project line count diagram' })).toBeVisible();

    // And I see the project's top folders and files listed
    expect(getByRole('heading', { name: 'my-project : 100 lines' })).toBeVisible();
    expect(getByRole('navigation', { name: 'my-project content list' })).toBeVisible();
    expect(getByRole('button', { name: 'src : 70 lines' })).toBeVisible();
    expect(getByRole('button', { name: 'package.json : 30 lines' })).toBeVisible();
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('navigates to a folder on breadcrumb click', () => {
    expect.hasAssertions();

    // Given a project with an `src` folder
    const project = createTreeFromFiles([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ]);

    // And a rendered line view
    const renderResult = render(<LineView data={project} />);
    const { getByRole } = renderResult;

    // And I navigated to the `src` folder
    fireEvent.click(getLineListItemByName('src', renderResult));

    // When I click the `my-project` breadcrumb
    fireEvent.click(getBreadcrumb('my-project', renderResult));

    // Then I see the breadcrumbs for the project root
    expect(getBreadcrumbTrail(renderResult)).toHaveTextContent('my-project');

    // And I see a visualization from the project root
    expect(false).toBe(true);

    // And I see a list of the project's top folders and files
    expect(getByRole('heading', { name: 'my-project : 100 lines' })).toBeVisible();
  });
  it.todo('navigates to a folder on diagram segment click');
  it.todo('navigates to the parent folder on diagram center click');
  it.todo('previews a folder or file on diagram segment hover (navigation and list)');
  it.todo('highlights a folder or file on diagram segment hover (breadcrumb and diagram segment)');

  it.todo('navigates to a folder on list item click');
  it.todo('highlights a folder or file on list item hover (diagram segment)');
});
