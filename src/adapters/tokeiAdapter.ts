import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { flatMap } from 'lodash';

import {
  Project,
  ProjectFolder,
  // isFile,
  ProjectItemTypeFile,
  ProjectItemTypeFolder,
  ProjectItem,
} from '../project/Project';
import {
  Folder,
  isFile,
  FileSystemNodeTypeFolder,
  addFileByPath,
  filenameFromPath,
  FileSystemNodeTypeFile,
  createTree,
  FileSystemNode,
} from '../utility/file-tree';

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

type FSNodeWithNumberOfLines = FileSystemNode<{ numberOfLines: number }>;
type FSNodeWithNumberOfLinesOnLeaves = FileSystemNode<{}, { numberOfLines: number }>;

/**
 *
 */
function withNumberOfLines(node: FSNodeWithNumberOfLinesOnLeaves): FSNodeWithNumberOfLines {
  // Files already have the number of lines
  if (isFile(node)) return node;

  // For folders, ensure number of lines for all children
  const children = node.children.map(withNumberOfLines);

  // Based on these children, compute the number of lines for this folder
  const numberOfLines = children.reduce((total, item) => total + item.numberOfLines, 0);

  // Return this folder with the accurate number of lines
  return {
    ...node,
    numberOfLines,
    children,
  };
}

/**
 *
 */
function sortedByNumberOfLines(node: FSNodeWithNumberOfLines): FSNodeWithNumberOfLines {
  // No need to sort files
  if (isFile(node)) return node;

  const children = node.children
    // Sort any folders within this folder
    .map(sortedByNumberOfLines)
    // Sort this folder's children by number of lines
    .sort((a, b) => (a.numberOfLines > b.numberOfLines ? -1 : 1));

  // Return the folder with sorted childrens
  return {
    ...node,
    children,
  };
}

/**
 *
 */
function half(num: number): number {
  return Math.floor(num / 2);
}

/**
 *
 */
function withMiddleLineFromZero(node: FSNodeWithNumberOfLines, baseline: number): ProjectItem {
  // For files, simply add the middle line from zero
  if (isFile(node)) return { ...node, middleLineFromZero: baseline + half(node.numberOfLines) };

  // For folders, add middle to all children, moving up the baseline appropriately
  let childBaseline = baseline;
  const children = node.children.map((child) => {
    const childWithMiddle = withMiddleLineFromZero(child, childBaseline);
    childBaseline += child.numberOfLines;
    return childWithMiddle;
  });
  // const previousItems = items.slice(0, Math.min(0, i - 1));
  // const numberOfLinesInPreviousItems = previousItems.reduce(
  //   (total, previousItem) => total + previousItem.numberOfLines,
  //   0
  // );
  // return withMedianLineFromZero(item, baseline + numberOfLinesInPreviousItems);
  // });
  // const contentWithMedianLineFromZero = folder.content.map(item => {
  //   if (item.type === ProjectItemType.File) return item;
  //   return withMedianLineFromZero(item);
  // });

  // let total = 0;
  // const medianLineFromZero =

  // Return the folder with the accurate middle, and all its children with middles
  return {
    ...node,
    middleLineFromZero: baseline + half(node.numberOfLines),
    children,
  };
}

export default function tokeiAdapter(input: unknown, projectName: string): Project {
  // Parse Tokei JSON
  const parseResult = tokeiJsonType.decode(input);
  if (isLeft(parseResult)) throw new Error(tokeiParseErrorMessage);
  const parsed = parseResult.right;

  // Extract a list of file stats
  const languages = Object.values(parsed.inner);
  const files = flatMap(languages, (language) => language.stats).map((file) => {
    // Swap any "current folder" specifiers in the file paths with the project name
    const path = file.name.split('/');
    if (path[0] === '.') path.splice(0, 1);
    return { ...file, name: path.join('/') };
  });

  console.log(files);
  // // Create a project root
  // const root: Project = {
  //   type: ProjectItemTypeFolder,
  //   filename: '.',
  //   path: '.',
  //   numberOfLines: -1,
  //   medianLineFromZero: -1,
  //   children: [],
  // };

  // Instantiate
  // const root: Folder<{}, { numberOfLines: number }> = {
  //   type: FileSystemNodeTypeFolder,
  //   filename: projectName,
  //   path: projectName,
  //   children: [],
  // };

  const root: Folder<{}, { numberOfLines: number }> = createTree(projectName, {});

  // Construct the file tree
  files.forEach((file) => {
    addFileByPath(root, file.name, { numberOfLines: file.code });
    // addFileByPath(root, {
    //   type: FileSystemNodeTypeFile,
    //   filename: filenameFromPath(file.name),
    //   path: file.name,
    //   numberOfLines: file.code,
    // });
    // let currentNode: ProjectFolder = root;
    // const path = file.name.split('/');

    // // Pop the last path segment as the filename
    // const filename = path.pop();
    // if (filename == null) throw new Error(tokeiParseErrorMessage);

    // // For every path element, add a folder to the tree if necessary
    // path.forEach((elem, i) => {
    //   let nextNode = currentNode.children.find((node) => node.filename === elem);
    //   if (nextNode == null) {
    //     nextNode = {
    //       type: ProjectItemTypeFolder,
    //       filename: elem,
    //       path: path.slice(0, i + 1).join('/'),
    //       numberOfLines: -1,
    //       medianLineFromZero: -1,
    //       children: [],
    //     };
    //     currentNode.children.push(nextNode);
    //   }
    //   if (isFile(nextNode)) throw new Error(tokeiParseErrorMessage);
    //   currentNode = nextNode;
    // });

    // // Add the file to its direct parent folder
    // currentNode.children.push({
    //   type: ProjectItemTypeFile,
    //   filename,
    //   path: file.name,
    //   numberOfLines: -1,
    //   medianLineFromZero: -1,
    // });
  });

  const rootWithNumberOfLines = withNumberOfLines(root);
  const rootSortedByNumberOfLines = sortedByNumberOfLines(rootWithNumberOfLines);
  const project = withMiddleLineFromZero(rootSortedByNumberOfLines, 0);

  // const parsed = getOrElse(() => {
  //   throw new Error(tokeiParseErrorMessage);
  // })(tokeiJsonType.decode(input));

  return project;
}
