import React, { SFC } from 'react';
import SlocView from '../SlocView/SlocView';
import tokeiAdapter from '../adapters/tokeiAdapter';
import fromTokei from '../../input/fromTokei.json';

// Get demo input data
const data = tokeiAdapter(fromTokei, 'zon');

/**
 *
 */
const App: SFC = function App() {
  return <SlocView data={data} />;
};

export default App;
