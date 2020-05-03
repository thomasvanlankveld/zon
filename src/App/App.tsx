import React, { SFC } from 'react';
import SlocView from '../SlocView/SlocView';
import { Project, ProjectItemType } from '../project/Project';

const data: Project = {
  type: ProjectItemType.Folder,
  name: 'my-project',
  content: [
    { type: ProjectItemType.File, name: 'foo.js', numberOfLines: 14 },
    { type: ProjectItemType.File, name: 'bar.js', numberOfLines: 75 },
    { type: ProjectItemType.File, name: 'baz.js', numberOfLines: 35 },
    { type: ProjectItemType.File, name: 'qux.js', numberOfLines: 97 },
    { type: ProjectItemType.File, name: 'quux.js', numberOfLines: 54 },
  ],
};

/**
 *
 */
const App: SFC = function App() {
  return <SlocView data={data} />;
};

export default App;
