import t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { flatMap } from 'lodash';
import { DeepPartial } from 'utility-types';

import { Project, ProjectItemType, Folder } from '../project/Project';

const tokeiLanguageType = t.string;

const tokeiStatsType = t.type({
  blanks: t.number,
  code: t.number,
  comments: t.number,
  lines: t.number,
});

const tokeiJsonType = t.type({
  inner: t.record(
    tokeiLanguageType,
    t.intersection([
      tokeiStatsType,
      t.type({
        inaccurate: t.boolean,
        stats: t.array(t.intersection([tokeiStatsType, t.type({ name: t.string })])),
      }),
    ])
  ),
});

type TokeiJson = t.TypeOf<typeof tokeiJsonType>;

// type TokeiLanguage = string;

// interface TokeiStats {
//   blanks: number;
//   code: number;
//   comments: number;
//   lines: number;
// }

// interface TokeiJson {
//   inner: {
//     [language in TokeiLanguage]: TokeiStats & {
//       inaccurate: boolean;
//       stats: (TokeiStats & { name: string })[];
//     };
//   };
// }

const tokeiParseErrorMessage = 'Could not parse Tokei json';

export default function tokeiAdapter(input: unknown): Project {
  // Parse Tokei JSON
  const parseResult = tokeiJsonType.decode(input);
  if (isLeft(parseResult)) throw new Error(tokeiParseErrorMessage);
  const parsed = parseResult.right;

  // Extract a list of file stats
  const languages = Object.values(parsed.inner);
  const files = flatMap(languages, (language) => language.stats);

  // Create a project root
  const root: Project = {
    type: ProjectItemType.Folder,
    filename: '.',
    path: '.',
    numberOfLines: -1,
    medianLineFromZero: -1,
    content: [],
  };

  // Construct the file tree
  files.forEach((file) => {
    let currentNode: Folder = root;
    const path = file.name.split('/');

    // Pop the last path segment as the filename
    const filename = path.pop();
    if (filename == null) throw new Error(tokeiParseErrorMessage);

    // For every path element, add a folder to the tree if necessary
    path.forEach((elem, i) => {
      let nextNode = currentNode.content.find((node) => node.filename === elem);
      if (nextNode == null) {
        nextNode = {
          type: ProjectItemType.Folder,
          filename: elem,
          path: path.slice(0, i + 1).join('/'),
          numberOfLines: -1,
          medianLineFromZero: -1,
          content: [],
        };
        currentNode.content.push(nextNode);
      }
      if (nextNode.type !== ProjectItemType.Folder) throw new Error(tokeiParseErrorMessage);
      currentNode = nextNode;
    });

    // Add the file to its direct parent folder
    currentNode.content.push({
      type: ProjectItemType.File,
      filename,
      path: file.name,
      numberOfLines: -1,
      medianLineFromZero: -1,
    });
  });

  // const parsed = getOrElse(() => {
  //   throw new Error(tokeiParseErrorMessage);
  // })(tokeiJsonType.decode(input));

  return root;
}

function withNumberOfLines(folder: Folder): Folder {
  // Compute number of lines for every subfolder
  const contentWithNumberOfLines = folder.content.map((item) => {
    if (item.type === ProjectItemType.File) return item;
    return withNumberOfLines(item);
  });

  // Compute number of lines for this folder
  const numberOfLines = contentWithNumberOfLines.reduce(
    (total, item) => total + item.numberOfLines,
    0
  );

  // let total = 0;
  // folder.content.forEach((item) => {
  //   if (item.type === ProjectItemType.File) {
  //     total += item.numberOfLines;
  //   } else {
  //     total += withNumberOfLines(item).numberOfLines;
  //   }
  // });

  // // Compute number of lines for the folder
  // const numberOfLines = folder.content.reduce((total, item) => {
  //   if (item.type === ProjectItemType.File) return item.numberOfLines;
  //   return total + withNumberOfLines(item).numberOfLines;
  // }, 0);

  // Return this folder with the accurate number of lines
  return {
    numberOfLines,
    ...folder,
  };
}

function sortedByNumberOfLines(folder: Folder): Folder {
  // Sort any folders within this folder
  const content = folder.content.map((item) => {
    if (item.type === ProjectItemType.File) return item;
    return sortedByNumberOfLines(item);
  });

  // Sort this folder's content by number of lines
  const sortedContent = content.sort((a, b) => (a.numberOfLines < b.numberOfLines ? -1 : 1));

  // Return the folder with sorted contents
  return {
    content: sortedContent,
    ...folder,
  };
}

// function withMedianLineFromZero(folder: Folder, ): Folder {

//   const contentWithMedianLineFromZero = folder.content.map(item => {
//     if (item.type === ProjectItemType.File) return item;
//     return withMedianLineFromZero(item);
//   });

//   let total = 0;
//   const medianLineFromZero =

//   // Return the folder with the accurate median line from zero
//   return {
//     medianLineFromZero: Math.floor(folder.numberOfLines / 2),
//     ...folder,
//   };
// }
