import { createMemo, For, type Setter } from "solid-js";
import {
  getNodeByPath,
  NODE_TYPE,
  type Path,
  type Node,
  getDisplayName,
} from "../../utils/zon";

type ReportListProps = {
  root: Node;
  listRootPath: Path | null;
  setHoverListPath: Setter<Path | null>;
  setSelectedRootPath: Setter<Path | null>;
};

export default function ReportList(props: ReportListProps) {
  // Select root node for the list view (either root or the file of the hovered arc)
  const listRoot = createMemo(() =>
    props.listRootPath != null
      ? getNodeByPath(props.root, props.listRootPath)
      : props.root,
  );

  const listNodes = () => {
    const root = listRoot();

    if (root.type === NODE_TYPE.FILE) {
      return [];
    }

    return root.type === NODE_TYPE.FOLDER
      ? root.children
      : root.groupedChildren;
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
              onMouseEnter={[props.setHoverListPath, child.path]}
              onMouseLeave={[props.setHoverListPath, null]}
              onClick={[props.setSelectedRootPath, child.path]}
            >
              {getDisplayName(child.name)} {child.numberOfLines}
            </button>
          )}
        </For>
      </nav>
    </div>
  );
}
