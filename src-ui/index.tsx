import React from 'react';
import { render } from 'react-dom';

import App from './App/App';
import createZonClientFake from './services/zon-client/createZonClientFake';
import createZonClientHTTP from './services/zon-client/createZonClientHTTP';
import './index.css';

// Create zon client service
const zonClient =
  process.env.NODE_ENV === 'development'
    ? createZonClientFake()
    : createZonClientHTTP('http://localhost:3030');

// Render the app
render(<App zonClient={zonClient} />, document.getElementById('root'));
