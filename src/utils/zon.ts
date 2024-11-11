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
  numberOfLines: number;
  firstLine: number;
  depth: number;
  height: number;
  children: Node[];
  dimensions: {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  };
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

  for (const language of languageValues) {
    for (const tokeiReport of language.reports) {
      const fileName = tokeiReport.name.slice(numberOfCharactersToRemove);
      const fileNameSegments = fileName.split("/").slice();

      for (let i = 0; i < fileNameSegments.length; i++) {
        const nodePath = fileNameSegments.slice(0, i + 1).join("/");

        if (nodePath in nodes) {
          nodes[nodePath].stats.blanks += tokeiReport.stats.blanks;
          nodes[nodePath].stats.code += tokeiReport.stats.code;
          nodes[nodePath].stats.comments += tokeiReport.stats.comments;
          nodes[nodePath].numberOfLines += getNumberOfLines(
            tokeiReport.stats,
            lineTypes,
          );
        } else {
          const node = {
            stats: tokeiReport.stats,
            path: nodePath,
            numberOfLines: getNumberOfLines(tokeiReport.stats, lineTypes),
            depth: i,
            // `height` and `children` updated as we build the tree
            height: 0,
            children: [],
            // Actual values of `firstLine` and `dimensions` can only be determined after sorting
            firstLine: 0,
            dimensions: { x0: 0, x1: 0, y0: 0, y1: 0 },
          };

          nodes[nodePath] = node;

          if (i > 0) {
            const parentName = fileNameSegments.slice(0, i).join("/");
            const parent = nodes[parentName];

            parent.children.push(node);
            parent.height = Math.max(
              parent.height,
              fileNameSegments.length - i,
            );
          }
        }
      }
    }
  }

  const root = nodes[projectName];

  sortTree(root);
  addDimensions(root, root.height, root.numberOfLines, 0);

  return root;
}

function getNumberOfLines(stats: CodeStats, lineTypes: LineType[]): number {
  return lineTypes.reduce((total, type) => total + stats[type], 0);
}

function sortTree(node: Node): void {
  node.children.sort((left, right) =>
    left.numberOfLines > right.numberOfLines ? 1 : -1,
  );

  for (const child of node.children) {
    sortTree(child);
  }
}

function addDimensions(
  node: Node,
  maxHeight: number,
  totalNumberOfLines: number,
  lineNumber: number,
): void {
  for (const child of node.children) {
    child.firstLine = lineNumber;

    // TODO: Extract dimension calculation so it can be calculated after taking navigation into account
    child.dimensions.x0 = child.firstLine / totalNumberOfLines;
    child.dimensions.x1 =
      child.dimensions.x0 + child.numberOfLines / totalNumberOfLines;
    child.dimensions.y0 = child.depth / maxHeight;
    child.dimensions.y1 = child.dimensions.y0 - 1 / maxHeight;

    addDimensions(child, maxHeight, totalNumberOfLines, lineNumber);

    lineNumber += child.numberOfLines;
  }
}

export function getDescendants(node: Node): Node[] {
  return [...node.children, ...node.children.flatMap(getDescendants)];
}
