import React, { SFC, useEffect, useState } from 'react';
import SlocView from '../SlocView/SlocView';
import tokeiAdapter from '../adapters/tokeiAdapter';
// import fromTokei from '../../input/fromTokei.json';
import { Project } from '../project/Project';

// // Get demo input data
// const data = tokeiAdapter(fromTokei, 'zon');

/**
 *
 */
const App: SFC = function App() {
  const [data, setData] = useState<Project | null>(null);

  useEffect(() => {
    if (data == null) {
      fetch('http://localhost:3030/input')
        .then(async (response) => {
          const json = await response.json();
          const parsed = tokeiAdapter(json, 'zon');
          setData(parsed);
        })
        .catch((errr) => {
          throw errr;
        });
    }
  }, [data]);

  return data == null ? <p>Loading...</p> : <SlocView data={data} />;
};

export default App;
