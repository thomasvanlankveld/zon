import React, { SFC } from 'react';
import SlocView from '../SlocView/SlocView';
import {
  Project,
  ProjectItem,
  ProjectItemTypeFile,
  ProjectItemTypeFolder,
} from '../project/Project';
import tokeiAdapter from '../adapters/tokeiAdapter';
import fromTokei from '../../input/fromTokei.json';

// function sumLines(children: ProjectItem[]): number {
//   return children.reduce((total, item) => total + item.numberOfLines, 0);
// }

// const children: ProjectItem[] = [
//   {
//     type: ProjectItemTypeFile,
//     filename: 'foo.js',
//     path: './foo.js',
//     numberOfLines: 14,
//     middleLineFromZero: 7,
//   },
//   {
//     type: ProjectItemTypeFile,
//     filename: 'bar.js',
//     path: './bar.js',
//     numberOfLines: 75,
//     middleLineFromZero: 51,
//   },
//   {
//     type: ProjectItemTypeFile,
//     filename: 'baz.js',
//     path: './baz.js',
//     numberOfLines: 35,
//     middleLineFromZero: 106,
//   },
//   {
//     type: ProjectItemTypeFile,
//     filename: 'qux.js',
//     path: './qux.js',
//     numberOfLines: 97,
//     middleLineFromZero: 172,
//   },
//   {
//     type: ProjectItemTypeFile,
//     filename: 'quux.js',
//     path: './quux.js',
//     numberOfLines: 54,
//     middleLineFromZero: 248,
//   },
// ];

// const data: Project = {
//   type: ProjectItemTypeFolder,
//   filename: 'my-project',
//   path: '.',
//   numberOfLines: sumLines(children),
//   middleLineFromZero: Math.floor(sumLines(children) / 2),
//   children,
// };

const data = tokeiAdapter(fromTokei, 'shamash');

console.log(data);

/**
 *
 */
const App: SFC = function App() {
  return <SlocView data={data} />;
};

export default App;
