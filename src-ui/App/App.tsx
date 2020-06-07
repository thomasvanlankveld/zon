import React, { SFC, useEffect, useState } from 'react';

import SlocView from '../SlocView/SlocView';
import { Project } from '../project/Project';
import zonAdapter from '../adapters/zonAdapter';
import tokeiAdapter from '../adapters/tokeiAdapter';

/**
 *
 */
const App: SFC = function App() {
  const [data, setData] = useState<Project | null>(null);

  useEffect(() => {
    if (data == null) {
      if (process.env.NODE_ENV === 'development') {
        import('../../input/redux.json')
          .then(async (reduxData) => {
            const parsed = tokeiAdapter(reduxData, 'redux');
            setData(parsed);
          })
          .catch((errr) => {
            throw errr;
          });
      } else {
        fetch('http://localhost:3030/input')
          .then(async (response) => {
            const json = await response.json();
            const parsed = zonAdapter(json);
            setData(parsed);
          })
          .catch((errr) => {
            throw errr;
          });
      }
    }
  }, [data]);

  return data == null ? <p>Loading...</p> : <SlocView data={data} />;
};

export default App;
