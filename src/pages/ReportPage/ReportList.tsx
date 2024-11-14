import { createMemo, For, type Setter } from "solid-js";
import { getNodeByPath, type Node } from "../../utils/zon";

type ReportListProps = {
  root: Node;
  listRootPath: string | null;
  setHoverListPath: Setter<string | null>;
  setDiagramRootPath: Setter<string | null>;
};

export default function ReportList(props: ReportListProps) {
  // Select root node for the list view (either root or the file of the hovered arc)
  const listRoot = createMemo(() =>
    props.listRootPath != null
      ? getNodeByPath(props.root, props.listRootPath)
      : props.root,
  );

  return (
    <div>
      <h4
        style={{
          color: "white",
          "margin-bottom": "22px",
          "font-weight": "normal",
          "white-space": "pre",
        }}
      >
        {listRoot().name} {listRoot().numberOfLines}
      </h4>
      <nav aria-label={`${listRoot.name} content list`}>
        <For each={listRoot().children}>
          {(child) => (
            <button
              style={{
                color: child.color,
                cursor: "pointer",
                display: "block",
                margin: 0,
                "white-space": "pre",
              }}
              onClick={() => props.setDiagramRootPath(child.path)}
              onMouseEnter={() => props.setHoverListPath(child.path)}
              onMouseLeave={() => props.setHoverListPath(null)}
            >
              {child.name} {child.numberOfLines}
            </button>
          )}
        </For>
      </nav>
    </div>
  );
}
