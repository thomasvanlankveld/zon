import React from 'react';
import { render } from '@testing-library/react';

import App from './App';
import createZonClientMock from '../services/zon-client/test-support/createZonClientMock';
import nextTick from '../test-support/nextTick';
import createProject from '../adapters/createProject';

describe('App', () => {
  // eslint-disable-next-line jest/expect-expect, jest/prefer-expect-assertions
  it('renders without crashing', () => {
    // Given a client
    const zonClient = createZonClientMock();
    zonClient.getProjectData.mockReturnValue(new Promise(() => null));

    // When I render the App
    render(<App zonClient={zonClient} />);

    // Then it does not crash
    // No assertion needed
  });

  it('shows a loading indicator when no data is available', () => {
    expect.hasAssertions();

    // Given a client that does not resolve immediately
    const zonClient = createZonClientMock();
    zonClient.getProjectData.mockReturnValue(
      new Promise(() => {
        /* Never resolve! Never surrender! */
      })
    );

    // When I render the App
    const { getByText } = render(<App zonClient={zonClient} />);

    // The it shows a loading indicator
    expect(getByText('Loading...')).toBeVisible();
  });

  it('renders the line view with project data from the client', async () => {
    expect.hasAssertions();

    // Given a project
    const project = createProject([
      { path: 'my-project/package.json', data: { numberOfLines: 30 } },
      { path: 'my-project/src/foo.ts', data: { numberOfLines: 50 } },
      { path: 'my-project/src/bar.ts', data: { numberOfLines: 20 } },
    ]);

    // And a client that returns the project when called
    const zonClient = createZonClientMock();
    zonClient.getProjectData.mockReturnValue(Promise.resolve(project));

    // When I render the App
    const { getByRole } = render(<App zonClient={zonClient} />);
    // act(())
    await nextTick();

    // Then I see the project visualized
    expect(getByRole('navigation', { name: /breadcrumbs/ })).toHaveTextContent('my-project');
  });
});
