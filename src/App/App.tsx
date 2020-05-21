import React, { SFC } from 'react';
import SlocView from '../SlocView/SlocView';
import { Project, ProjectItem, ItemTypeFile, ItemTypeFolder } from '../project/Project';

function sumLines(children: ProjectItem[]): number {
  return children.reduce((total, item) => total + item.numberOfLines, 0);
}

const children: ProjectItem[] = [
  {
    type: ItemTypeFile,
    filename: 'foo.js',
    path: './foo.js',
    numberOfLines: 14,
    medianLineFromZero: 7,
  },
  {
    type: ItemTypeFile,
    filename: 'bar.js',
    path: './bar.js',
    numberOfLines: 75,
    medianLineFromZero: 51,
  },
  {
    type: ItemTypeFile,
    filename: 'baz.js',
    path: './baz.js',
    numberOfLines: 35,
    medianLineFromZero: 106,
  },
  {
    type: ItemTypeFile,
    filename: 'qux.js',
    path: './qux.js',
    numberOfLines: 97,
    medianLineFromZero: 172,
  },
  {
    type: ItemTypeFile,
    filename: 'quux.js',
    path: './quux.js',
    numberOfLines: 54,
    medianLineFromZero: 248,
  },
];

const data: Project = {
  type: ItemTypeFolder,
  filename: 'my-project',
  path: '.',
  numberOfLines: sumLines(children),
  medianLineFromZero: Math.floor(sumLines(children) / 2),
  children,
};

/**
 *
 */
const App: SFC = function App() {
  return <SlocView data={data} />;
};

export default App;
