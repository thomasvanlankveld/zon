import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import LineView from './LineView';
import { createTreeFromFiles } from '../file-tree';
import getBreadcrumbTrail from './breadcrumb-trail/test-support/getBreadcrumbTrail';
import getBreadcrumb from './breadcrumb-trail/test-support/getBreadcrumb';
import getDiagram from './diagram/test-support/getDiagram';
import getDiagramPath from './diagram/test-support/getDiagramPath';
import getLineListElements from './list/test-support/getLineListElements';

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

    // Then I see the breadcrumbs for the project's root
    expect(getBreadcrumbTrail(renderResult)).toHaveTextContent('my-project');
    expect(getBreadcrumb('my-project', renderResult)).toBeVisible();

    // And I see the project visualized
    expect(getDiagram('my-project', renderResult)).toBeVisible();
    expect(getDiagramPath('my-project/package.json', renderResult)).toBeVisible();
    expect(getDiagramPath('my-project/src', renderResult)).toBeVisible();
    expect(getDiagramPath('my-project/src/foo.ts', renderResult)).toBeVisible();
    expect(getDiagramPath('my-project/src/bar.ts', renderResult)).toBeVisible();

    // Then I see a list of the top level folder's contents
    const lineListElements = getLineListElements(
      'my-project',
      ['package.json', 'src'],
      renderResult
    );
    lineListElements.forEach((element) => expect(element).toBeVisible());
  });

  it('navigates to a folder on breadcrumb click', () => {
    expect.hasAssertions();

    // Given a project with an `src` folder
    const project = createTreeFromFiles([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ]);

    // And a rendered line view
    const renderResult = render(<LineView data={project} />);

    // And I navigated to `src/foo.ts`
    fireEvent.click(getDiagramPath('my-project/src/foo.ts', renderResult));

    // When I click the `src` breadcrumb
    fireEvent.click(getBreadcrumb('src', renderResult));

    // Then I see the breadcrumbs for the `src` folder
    expect(getBreadcrumbTrail(renderResult)).toHaveTextContent('my-project / src');

    // And I see a visualization from the `src` folder
    expect(getDiagramPath('my-project/src', renderResult)).toBeVisible();
    expect(getDiagramPath('my-project/src/foo.ts', renderResult)).toBeVisible();
    expect(getDiagramPath('my-project/src/bar.ts', renderResult)).toBeVisible();

    // Then I see a list of the `src` folder's contents
    const lineListElements = getLineListElements('src', ['foo.ts', 'bar.ts'], renderResult);
    lineListElements.forEach((element) => expect(element).toBeVisible());
  });

  it('previews a folder or file on diagram segment hover (navigation and list)', () => {
    expect.hasAssertions();

    // Given a project with an `src` folder
    const project = createTreeFromFiles([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ]);

    // And a rendered line view
    const renderResult = render(<LineView data={project} />);

    // When I hover my cursor over the diagram path for the `src` folder
    fireEvent.mouseEnter(getDiagramPath('my-project/src', renderResult));

    // Then I see the breadcrumbs for the `src` folder
    expect(getBreadcrumbTrail(renderResult)).toHaveTextContent('my-project / src');

    // Then I see a list of the `src` folder's contents
    const lineListElements = getLineListElements('src', ['foo.ts', 'bar.ts'], renderResult);
    lineListElements.forEach((element) => expect(element).toBeVisible());
  });

  it.todo('navigates to a folder on diagram segment click');
  it.todo('navigates to the parent folder on diagram center click');
  it.todo('highlights a folder or file on diagram segment hover (breadcrumb and diagram segment)');

  it.todo('navigates to a folder on list item click');
  it.todo('highlights a folder or file on list item hover (diagram segment)');
});
