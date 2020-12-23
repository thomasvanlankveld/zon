import React, { FC, useEffect, useState } from 'react';

import LineView from '../LineView/LineView';
import { Project } from '../project/Project';
import { ZonClient } from '../services/zon-client/ZonClient';

interface AppProps {
  zonClient: ZonClient;
}

/**
 * The zon app
 */
const App: FC<AppProps> = function App(props) {
  const { zonClient } = props;

  // Keep project data
  const [data, setData] = useState<Project | null>(null);

  // If there is no data, get it
  useEffect(() => {
    if (data == null) {
      zonClient
        .getProjectData()
        .then((projectData) => setData(projectData))
        .catch((errr) => {
          throw errr;
        });
    }
  }, [data]);

  // Render the page or a loading indicator
  return data == null ? <h3 style={{ color: 'white' }}>Loading...</h3> : <LineView data={data} />;
};

export default App;
