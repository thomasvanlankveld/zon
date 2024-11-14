import { createMemo, For, Show } from "solid-js";
import { getNodesAlongPath, type Node } from "../../utils/zon";

type BreadcrumbsProps = {
  root: Node;
  path: string;
  setDiagramRootPath: (path: string) => void;
};

export default function Breadcrumbs(props: BreadcrumbsProps) {
  const nodes = createMemo(() => getNodesAlongPath(props.root, props.path));
  const lastNodeIndex = () => nodes().length - 1;

  return (
    <nav style={{ "margin-bottom": "20px" }} aria-label="breadcrumbs">
      <For each={nodes()}>
        {(node, i) => (
          <>
            <button
              style={{
                color: node.color,
                cursor: "pointer",
              }}
              onClick={() => props.setDiagramRootPath(node.path)}
            >
              <span>{node.name}</span>
            </button>
            <Show when={i() !== lastNodeIndex()}>
              <span style={{ color: "white" }}>{" / "}</span>
            </Show>
          </>
        )}
      </For>
    </nav>
  );
}
