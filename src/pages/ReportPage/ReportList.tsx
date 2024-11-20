import { createMemo, For, type Setter } from "solid-js";
import {
  getNodeByPath,
  getParentPath,
  NODE_TYPE,
  type Path,
  type Node,
  getDisplayName,
  //   getPathString,
} from "../../utils/zon";

type ReportListProps = {
  root: Node;
  listRootPath: Path | null;
  setHoverListPath: Setter<Path | null>;
  setDiagramRootPath: Setter<Path | null>;
};

export default function ReportList(props: ReportListProps) {
  // Select root node for the list view (either root or the file of the hovered arc)
  const listRoot = createMemo(() =>
    props.listRootPath != null
      ? getNodeByPath(props.root, props.listRootPath)
      : props.root,
  );

  function getTargetPath(node: Node): Path | null {
    if (node.type === NODE_TYPE.GROUP) {
      return getParentPath(node.path);
    }

    return node.path;
  }

  const listNodes = () => {
    const root = listRoot();

    if (root.type === NODE_TYPE.FILE) {
      return [];
    }

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
