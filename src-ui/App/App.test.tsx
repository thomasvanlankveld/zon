import React from 'react';
import { render } from '@testing-library/react';

import App from './App';
import createZonClientMock from '../services/zon-client/test-support/createZonClientMock';

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

  // it .todo('gets project data from the client', () => {});

  // it .todo('renders the line view with the project data', () => {});
});
