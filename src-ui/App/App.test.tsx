import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import createZonClientMock from '../services/zon-client/test-support/createZonClientMock';

describe('App', () => {
  // eslint-disable-next-line jest/expect-expect, jest/prefer-expect-assertions
  it('renders without crashing', () => {
    // Given a client
    const zonClient = createZonClientMock();

    // When I render the App
    const div = document.createElement('div');
    ReactDOM.render(<App zonClient={zonClient} />, div);

    // Then it does not crash
    // No assertion needed
  });
});
