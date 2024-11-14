import { For } from "solid-js";
import { getNodeByPath, type Node } from "../../utils/zon";

type ReportListProps = {
  root: Node;
  listRootPath: string | null;
  setHoverListPath: (path: string | null) => void;
  setDiagramRootPath: (path: string) => void;
};

export default function ReportList(props: ReportListProps) {
  // Select root node for the list view (either root or the file of the hovered arc)
  const listRoot = () =>
    props.listRootPath != null
      ? getNodeByPath(props.root, props.listRootPath)
      : props.root;

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
                // color: colorNode(child),
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