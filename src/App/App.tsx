import React, { SFC } from 'react';
import SlocView from '../SlocView/SlocView';
import { Project, ProjectItemType, ProjectItem } from '../project/Project';

function sumLines(content: ProjectItem[]): number {
  return content.reduce((total, item) => total + item.numberOfLines, 0);
}

const content: ProjectItem[] = [
  { type: ProjectItemType.File, name: 'foo.js', numberOfLines: 14 },
  { type: ProjectItemType.File, name: 'bar.js', numberOfLines: 75 },
  { type: ProjectItemType.File, name: 'baz.js', numberOfLines: 35 },
  { type: ProjectItemType.File, name: 'qux.js', numberOfLines: 97 },
  { type: ProjectItemType.File, name: 'quux.js', numberOfLines: 54 },
];

const data: Project = {
  type: ProjectItemType.Folder,
  name: 'my-project',
  numberOfLines: sumLines(content),
  content,
};

/**
 *
 */
const App: SFC = function App() {
  return <SlocView data={data} />;
};

export default App;
