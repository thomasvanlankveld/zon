import React, { SFC } from 'react';
import SlocView from '../SlocView/SlocView';
import { Project, ProjectItemType, ProjectItem } from '../project/Project';

function sumLines(content: ProjectItem[]): number {
  return content.reduce((total, item) => total + item.numberOfLines, 0);
}

const content: ProjectItem[] = [
  {
    type: ProjectItemType.File,
    filename: 'foo.js',
    path: './foo.js',
    numberOfLines: 14,
    medianLineFromZero: 7,
  },
  {
    type: ProjectItemType.File,
    filename: 'bar.js',
    path: './bar.js',
    numberOfLines: 75,
    medianLineFromZero: 51,
  },
  {
    type: ProjectItemType.File,
    filename: 'baz.js',
    path: './baz.js',
    numberOfLines: 35,
    medianLineFromZero: 106,
  },
  {
    type: ProjectItemType.File,
    filename: 'qux.js',
    path: './qux.js',
    numberOfLines: 97,
    medianLineFromZero: 172,
  },
  {
    type: ProjectItemType.File,
    filename: 'quux.js',
    path: './quux.js',
    numberOfLines: 54,
    medianLineFromZero: 248,
  },
];

const data: Project = {
  type: ProjectItemType.Folder,
  filename: 'my-project',
  path: '.',
  numberOfLines: sumLines(content),
  medianLineFromZero: Math.floor(sumLines(content) / 2),
  content,
};

/**
 *
 */
const App: SFC = function App() {
  return <SlocView data={data} />;
};

export default App;
