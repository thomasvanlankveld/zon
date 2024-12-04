import { NODE_TYPE, type Path, type SegmentName } from "./types.ts";

export function getProjectName(projectPath: string): string {
  const projectPathSegments = projectPath.split("/");

  return projectPathSegments[projectPathSegments.length - 1];
}

/**
 * For user-facing purposes
 * @param name
 * @returns
 */
export function getDisplayName(name: SegmentName, groupName: string): string {
  if (name === NODE_TYPE.GROUP) {
    return groupName;
  }

  if (typeof name === "symbol") {
    throw new Error(
      `Can't convert segment name "${name.toString()}" into a string, unknown symbol type`,
    );
  }

  return name;
}

/**
 * Use only for internal & debugging purposes
 * @param path
 * @returns
 */
export function getPathString(path: Path | null): string {
  if (path == null) {
    return "null";
  }

  return path
    .map((segment) =>
      segment === NODE_TYPE.GROUP ? 'Symbol("group")' : segment,
    )
    .join("/");
}

export function arePathsEqual(left: Path | null, right: Path | null): boolean {
  if (left == null && right == null) {
    return true;
  }

  if (left == null || right == null) {
    return false;
  }

  if (left.length !== right.length) {
    return false;
  }

  return left.every((segment, i) => segment === right[i]);
}

export function getParentPath(path: Path) {
  return path.slice(0, -1);
}
