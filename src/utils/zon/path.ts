import { GROUP_SEGMENT, type Path, type SegmentName } from "./types.ts";

/**
 * Get the last segment
 */
export function getLastSegment(reportPath: string): string {
  const reportPathSegments = reportPath.split("/");

  return reportPathSegments[reportPathSegments.length - 1];
}

/**
 * For user-facing purposes
 */
export function getDisplayName(name: SegmentName, groupName: string): string {
  if (name === GROUP_SEGMENT) {
    return groupName;
  }

  return name;
}

/**
 * Use only for internal & debugging purposes
 */
export function getPathString(path: Path | null): string {
  if (path == null) {
    return "null";
  }

  return path
    .map((segment) => (segment === GROUP_SEGMENT ? 'Symbol("group")' : segment))
    .join("/");
}

/**
 * Whether two paths are equal. If both paths are `null`, they are considered equal.
 */
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

/**
 * Whether the `child` path is actually a child of the `parent` path.
 * @param options.inclusive Whether to consider "the child is the parent" as `true`
 * @param options.direct When set to `true`, only checks the parent's direct children
 */
export function isChildPath(
  parent: Path | null,
  child: Path | null,
  options: { inclusive?: boolean; direct?: boolean } = {},
) {
  const inclusive = options.inclusive ?? false;
  const direct = options.direct ?? false;

  if (inclusive && parent == null && child == null) {
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

/**
 * Get the parent path
 */
export function getParentPath(path: Path) {
  return path.slice(0, -1);
}
