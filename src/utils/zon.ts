import { rainbow } from "./color.ts";
import { CodeStats, Languages } from "./tokei.ts";

export const LineType = {
  blanks: "blanks",
  code: "code",
  comments: "comments",
} as const;
export type LineType = keyof typeof LineType;

export type Node = {
  stats: CodeStats;
  path: string;
  name: string;
  numberOfLines: number;
  firstLine: number;
  color: string;
  depth: number;
  height: number;
  children: Node[];
};

export function getProjectName(projectPath: string): string {
  const projectPathSegments = projectPath.split("/");

  return projectPathSegments[projectPathSegments.length - 1];
}

export function createTree(
  projectPath: string,
  languages: Languages,
  lineTypes: LineType[],
) {
  const projectName = getProjectName(projectPath);
  const numberOfCharactersToRemove = projectPath.length - projectName.length;

  // Folders can have files in multiple languages, so ignoring those for now
  const languageValues = Object.values(languages);

  const nodes: { [name: string]: Node } = {};

  // For every programming language
  for (const language of languageValues) {
    // For every file
    for (const tokeiReport of language.reports) {
      const fileName = tokeiReport.name.slice(numberOfCharactersToRemove);
      const fileNameSegments = fileName.split("/");

      // Create or update all parent folders, then create the file
      for (let i = 0; i < fileNameSegments.length; i++) {
        const nodePath = fileNameSegments.slice(0, i + 1).join("/");

        if (nodePath in nodes) {
          const node = nodes[nodePath];
          node.stats.blanks += tokeiReport.stats.blanks;
          node.stats.code += tokeiReport.stats.code;
          node.stats.comments += tokeiReport.stats.comments;
          node.numberOfLines += getNumberOfLines(tokeiReport.stats, lineTypes);
          node.height = Math.max(node.height, fileNameSegments.length - i - 1);
        } else {
          const node = {
            stats: tokeiReport.stats,
            path: nodePath,
            name: fileNameSegments[i],
            numberOfLines: getNumberOfLines(tokeiReport.stats, lineTypes),
            depth: i,
            height: fileNameSegments.length - i - 1,
            // `children` updated as we build the tree
            children: [],
            // Actual values of `firstLine` and `color` can only be determined after sorting
            firstLine: 0,
            color: "",
          };

          nodes[nodePath] = node;

          if (i > 0) {
            const parentName = fileNameSegments.slice(0, i).join("/");
            const parent = nodes[parentName];

            parent.children.push(node);
          }
        }
      }
    }
  }

  const root = nodes[projectName];

  sortTree(root);
  addDeduced(root, root.numberOfLines, 0);

  return root;
}

function getNumberOfLines(stats: CodeStats, lineTypes: LineType[]): number {
  return lineTypes.reduce((total, type) => total + stats[type], 0);
}

function sortTree(node: Node): void {
  node.children.sort((left, right) =>
    left.numberOfLines < right.numberOfLines ? 1 : -1,
  );

  for (const child of node.children) {
    sortTree(child);
  }
}

function addDeduced(
  node: Node,
  totalNumberOfLines: number,
  lineNumber: number,
): void {
  for (const child of node.children) {
    child.firstLine = lineNumber;

    const middleLine = lineNumber + child.numberOfLines / 2;
    child.color = rainbow(middleLine / totalNumberOfLines);

    addDeduced(child, totalNumberOfLines, lineNumber);

    lineNumber += child.numberOfLines;
  }
}

export function getDescendants(node: Node): Node[] {
  return [...node.children, ...node.children.flatMap(getDescendants)];
}

export function getNodeByPath(root: Node, path: string): Node {
  const pathSegments = path.split("/");
  let node = root;

  for (let i = 1; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    const match = node.children.find((child) => child.name === segment);

    if (match == null) {
      throw new Error(
        `Could not find node "${path}" in "${root.name}": "${node.path}" does not have a child named "${segment}"`,
      );
    }

    node = match;
  }

  return node;
}

export function getNodesAlongPath(root: Node, path: string): Node[] {
  const pathSegments = path.split("/");
  let parent = root;

  return pathSegments.map((segment, i) => {
    if (i === 0) {
      return root;
    }

    const match = parent.children.find((child) => child.name === segment);

    if (match == null) {
      throw new Error(
        `Could not get nodes along path "${path}" in "${root.name}": "${parent.path}" does not have a child named "${segment}"`,
      );
    }

    parent = match;

    return match;
  });
}
