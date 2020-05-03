import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

describe('App', () => {
  // eslint-disable-next-line jest/expect-expect, jest/prefer-expect-assertions
  it('renders without crashing', () => {
    // When I render the App
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);

    // Then it does not crash
    // No assertion needed
  });
});
