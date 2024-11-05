import { Tokei } from "./tokei";

export namespace Zon {
  export const LineType = {
    blanks: "blanks",
    code: "code",
    comments: "comments",
  } as const;
  export type LineType = keyof typeof LineType;

  export type Node = Tokei.Report & {
    numberOfLines: number;
    depth: number;
    height: number;
    children: Node[];
  };

  export function getProjectName(projectPath: string): string {
    const projectPathSegments = projectPath.split("/");

    return projectPathSegments[projectPathSegments.length - 1];
  }

  export function getHierarchy(
    projectPath: string,
    languages: Tokei.Languages,
    lineTypes: LineType[]
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
          const nodeName = fileNameSegments.slice(0, i + 1).join("/");

          if (nodeName in nodes) {
            nodes[nodeName].stats.blanks += tokeiReport.stats.blanks;
            nodes[nodeName].stats.code += tokeiReport.stats.code;
            nodes[nodeName].stats.comments += tokeiReport.stats.comments;
            nodes[nodeName].numberOfLines += getNumberOfLines(
              tokeiReport.stats,
              lineTypes
            );
          } else {
            const node = {
              ...tokeiReport,
              name: nodeName,
              numberOfLines: getNumberOfLines(tokeiReport.stats, lineTypes),
              depth: i,
              height: 0,
              children: [],
            };

            nodes[nodeName] = node;

            if (i > 0) {
              const parentName = fileNameSegments.slice(0, i).join("/");
              const parent = nodes[parentName];

              parent.children.push(node);
              parent.height = Math.max(
                parent.height,
                fileNameSegments.length - i
              );
            }
          }
        }
      }
    }

    const root = nodes[projectName];

    sortHierarchy(root);

    return root;
  }

  function getNumberOfLines(stats: Tokei.CodeStats, lineTypes: LineType[]) {
    return lineTypes.reduce((total, type) => total + stats[type], 0);
  }

  function sortHierarchy(node: Node) {
    node.children.sort((left, right) =>
      left.numberOfLines > right.numberOfLines ? 1 : -1
    );

    for (const child of node.children) {
      sortHierarchy(child);
    }
  }
}
