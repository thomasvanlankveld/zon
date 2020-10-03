import React from 'react';
import { render } from '@testing-library/react';

import LineView from './LineView';
import { createTreeFromFiles } from '../file-tree';

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
    const { getByRole } = render(<LineView data={project} />);

    // Then I see the project name in the breadcrumbs
    expect(getByRole('navigation', { name: /breadcrumbs/ })).toHaveTextContent('my-project');
    expect(getByRole('button', { name: 'my-project' })).toBeVisible();

    // And I see the project visualized
    expect(getByRole('img', { name: 'my-project line count diagram' })).toBeVisible();

    // And I see the project's top folders and files listed
    expect(getByRole('heading', { name: 'my-project : 100 lines' })).toBeVisible();
    expect(getByRole('navigation', { name: 'my-project content list' })).toBeVisible();
    expect(getByRole('button', { name: 'src : 70 lines' })).toBeVisible();
    expect(getByRole('button', { name: 'package.json : 30 lines' })).toBeVisible();
  });
});
