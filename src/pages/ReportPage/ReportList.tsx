import { createMemo, For, type Setter } from "solid-js";
import {
  getNodeByPath,
  getParentPath,
  NODE_TYPE,
  type Path,
  type Node,
  getDisplayName,
  getPathString,
} from "../../utils/zon";

type ReportListProps = {
  root: Node;
  listRootPath: Path | null;
  setHoverListPath: Setter<Path | null>;
  setDiagramRootPath: Setter<Path | null>;
};

export default function ReportList(props: ReportListProps) {
  // Select root node for the list view (either root or the file of the hovered arc)
  const listRoot = createMemo(() => {
    const maybeListRoot =
      props.listRootPath != null
        ? getNodeByPath(props.root, props.listRootPath)
        : props.root;

    if (maybeListRoot.type === NODE_TYPE.FILE) {
      throw new Error(
        `Can't list files in "${getPathString(props.listRootPath)}", because it's a file`,
      );
    }

    return maybeListRoot;
  });

  function getTargetPath(node: Node): Path | null {
    const isReportRoot = node.path === props.root.path;
    const isListRoot = node.path === props.listRootPath;
    const isFile = node.type === NODE_TYPE.FILE;

    if (isReportRoot) {
      return null;
    } else if (isListRoot || isFile) {
      return getParentPath(node.path);
    } else {
      return node.path;
    }
  }

  const listNodes = () => {
    const root = listRoot();
    const children =
      root.type === NODE_TYPE.FOLDER ? root.children : root.groupedChildren;

    return children.map((child) => ({
      ...child,
      targetPath: getTargetPath(child),
    }));
  };

  return (
    <div style={{ flex: "1 1 0%" }}>
      <h4
        style={{
          color: "white",
          "margin-bottom": "22px",
          "font-weight": "normal",
          "white-space": "pre",
        }}
      >
        {getDisplayName(listRoot().name)} {listRoot().numberOfLines}
      </h4>
      <nav aria-label={`${listRoot.name} content list`}>
        <For each={listNodes()}>
          {(child) => (
            <button
              style={{
                color: child.color,
                cursor: "pointer",
                display: "block",
                margin: 0,
                "white-space": "pre",
              }}
              onMouseEnter={[props.setHoverListPath, child.targetPath]}
              onMouseLeave={[props.setHoverListPath, null]}
              onClick={[props.setDiagramRootPath, child.targetPath]}
            >
              {getDisplayName(child.name)} {child.numberOfLines}
            </button>
          )}
        </For>
      </nav>
    </div>
  );
}
