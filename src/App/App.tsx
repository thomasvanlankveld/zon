import React, { SFC } from 'react';
import SlocView from '../SlocView/SlocView';

const data = [14, 75, 35, 97, 54];

/**
 *
 */
const App: SFC = function App() {
  return <SlocView data={data} />;
};

export default App;
