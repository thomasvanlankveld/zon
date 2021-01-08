import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import LineView from './LineView';
import { createTreeFromFiles } from '../file-tree';
import getBreadcrumbTrail from './breadcrumb-trail/test-support/getBreadcrumbTrail';
import getBreadcrumb from './breadcrumb-trail/test-support/getBreadcrumb';
import getDiagramPath from './diagram/test-support/getDiagramPath';
import getLineListElements from './list/test-support/getLineListElements';
import getDiagramElements from './diagram/test-support/getDiagramElements';
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

    // Then I see the breadcrumbs for the project's root
    expect(getBreadcrumbTrail(renderResult)).toHaveTextContent('my-project');
    expect(getBreadcrumb('my-project', renderResult)).toBeVisible();

    // And I see the project visualized
    const diagramElements = getDiagramElements(
      'my-project',
      [
        'my-project/package.json',
        'my-project/src',
        'my-project/src/foo.ts',
        'my-project/src/bar.ts',
      ],
      renderResult
    );
    diagramElements.forEach((element) => expect(element).toBeVisible());

    // Then I see a list of the top level folder's contents
    const lineListElements = getLineListElements(
      'my-project',
      ['package.json', 'src'],
      renderResult
    );
    lineListElements.forEach((element) => expect(element).toBeVisible());
  });

  describe('breadcrumb trail actions', () => {
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
      const diagramElements = getDiagramElements(
        'my-project',
        ['my-project/src', 'my-project/src/foo.ts', 'my-project/src/bar.ts'],
        renderResult
      );
      diagramElements.forEach((element) => expect(element).toBeVisible());

      // Then I see a list of the `src` folder's contents
      const lineListElements = getLineListElements('src', ['foo.ts', 'bar.ts'], renderResult);
      lineListElements.forEach((element) => expect(element).toBeVisible());
    });
  });

  describe('diagram actions', () => {
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

      // And I still see the whole project visualized
      const diagramElements = getDiagramElements(
        'my-project',
        [
          'my-project/package.json',
          'my-project/src',
          'my-project/src/foo.ts',
          'my-project/src/bar.ts',
        ],
        renderResult
      );
      diagramElements.forEach((element) => expect(element).toBeVisible());

      // And I see a list of the `src` folder's contents
      const lineListElements = getLineListElements('src', ['foo.ts', 'bar.ts'], renderResult);
      lineListElements.forEach((element) => expect(element).toBeVisible());
    });

    it('navigates to a folder on diagram segment click', () => {
      expect.hasAssertions();

      // Given a project with an `src` folder
      const project = createTreeFromFiles([
        { path: 'my-project/package.json', data: { numberOfLines: 30 } },
        { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
        { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
      ]);

      // And a rendered line view
      const renderResult = render(<LineView data={project} />);

      // And I click on the diagram path for the `src` folder
      fireEvent.click(getDiagramPath('my-project/src', renderResult));

      // Then I see the breadcrumbs for the `src` folder
      expect(getBreadcrumbTrail(renderResult)).toHaveTextContent('my-project / src');

      // And I see a visualization from the `src` folder
      const diagramElements = getDiagramElements(
        'my-project',
        ['my-project/src', 'my-project/src/foo.ts', 'my-project/src/bar.ts'],
        renderResult
      );
      diagramElements.forEach((element) => expect(element).toBeVisible());

      // Then I see a list of the `src` folder's contents
      const lineListElements = getLineListElements('src', ['foo.ts', 'bar.ts'], renderResult);
      lineListElements.forEach((element) => expect(element).toBeVisible());
    });

    it('navigates to the parent folder on diagram center click', () => {
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

      // When I click on the diagram center
      fireEvent.click(getDiagramPath('my-project/src/foo.ts', renderResult));

      // Then I see the breadcrumbs for the `src` folder
      expect(getBreadcrumbTrail(renderResult)).toHaveTextContent('my-project / src');

      // And I see a visualization from the `src` folder
      const diagramElements = getDiagramElements(
        'my-project',
        ['my-project/src', 'my-project/src/foo.ts', 'my-project/src/bar.ts'],
        renderResult
      );
      diagramElements.forEach((element) => expect(element).toBeVisible());

      // Then I see a list of the `src` folder's contents
      const lineListElements = getLineListElements('src', ['foo.ts', 'bar.ts'], renderResult);
      lineListElements.forEach((element) => expect(element).toBeVisible());
    });
  });

  describe('list actions', () => {
    it('navigates to a folder on list item click', () => {
      expect.hasAssertions();

      // Given a project with an `src` folder
      const project = createTreeFromFiles([
        { path: 'my-project/package.json', data: { numberOfLines: 30 } },
        { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
        { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
      ]);

      // And a rendered line view
      const renderResult = render(<LineView data={project} />);

      // When I click on the `src` list item
      fireEvent.click(getLineListItemByName('src', renderResult));

      // Then I see the breadcrumbs for the `src` folder
      expect(getBreadcrumbTrail(renderResult)).toHaveTextContent('my-project / src');

      // And I see a visualization from the `src` folder
      const diagramElements = getDiagramElements(
        'my-project',
        ['my-project/src', 'my-project/src/foo.ts', 'my-project/src/bar.ts'],
        renderResult
      );
      diagramElements.forEach((element) => expect(element).toBeVisible());

      // Then I see a list of the `src` folder's contents
      const lineListElements = getLineListElements('src', ['foo.ts', 'bar.ts'], renderResult);
      lineListElements.forEach((element) => expect(element).toBeVisible());
    });

    it('highlights a folder or file on list item hover (diagram segment)', () => {
      expect.hasAssertions();

      // Given a project with an `src` folder
      const project = createTreeFromFiles([
        { path: 'my-project/package.json', data: { numberOfLines: 30 } },
        { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
        { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
      ]);

      // And a rendered line view
      const renderResult = render(<LineView data={project} />);

      // Then the diagram path for the `src` folder is *not* highlighted
      expect(getDiagramPath('my-project/src', renderResult)).toHaveStyle('fill: rgb(251,150,51);');

      // And the list item for the `src` folder is *not* highlighted
      expect(getLineListItemByName('src', renderResult)).toHaveStyle('color: rgb(251,150,51);');

      // When I hover my cursor over the `src` list item
      fireEvent.mouseEnter(getLineListItemByName('src', renderResult));

      // Then the diagram path for the `src` folder is highlighted
      expect(getDiagramPath('my-project/src', renderResult)).toHaveStyle('fill: rgb(255,174,76);');

      // And the list item for the `src` folder is highlighted
      expect(getLineListItemByName('src', renderResult)).toHaveStyle('color: rgb(255,174,76);');
    });
  });
});
