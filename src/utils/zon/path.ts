import { GROUP_SEGMENT, type Path, type SegmentName } from "./types.ts";

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
  if (name === GROUP_SEGMENT) {
    return groupName;
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
    .map((segment) => (segment === GROUP_SEGMENT ? 'Symbol("group")' : segment))
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

export function isChildPath(
  parent: Path | null,
  child: Path | null,
  options: { inclusive?: boolean; direct?: boolean } = {},
) {
  const inclusive = options.inclusive ?? false;
  const direct = options.direct ?? false;

  if (parent == null && child == null) {
    return true;
  }

  if (parent == null || child == null) {
    return false;
  }

  if (
    parent.length > child.length ||
    (!inclusive && parent.length === child.length) ||
    (direct && child.length - parent.length > 1)
  ) {
    return false;
  }

  for (let i = 0; i < parent.length; i++) {
    if (parent[i] !== child[i]) {
      return false;
    }
  }

  return true;
}

export function getParentPath(path: Path) {
  return path.slice(0, -1);
}
