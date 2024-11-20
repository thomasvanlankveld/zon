import { createMemo, For, type Setter, Show } from "solid-js";
import {
  getNodesAlongPath,
  type Path,
  type Node,
  getDisplayName,
} from "../../utils/zon";

type BreadcrumbsProps = {
  root: Node;
  path: Path;
  setDiagramRootPath: Setter<Path | null>;
};

export default function Breadcrumbs(props: BreadcrumbsProps) {
  function getTargetPath(node: Node): Path | null {
    const isReportRoot = node.path === props.root.path;
    return isReportRoot ? null : node.path;
  }

  const nodes = createMemo(() =>
    getNodesAlongPath(props.root, props.path).map((node) => ({
      ...node,
      targetPath: getTargetPath(node),
    })),
  );
  const lastNodeIndex = () => nodes().length - 1;

  return (
    <nav style={{ "margin-bottom": "20px" }} aria-label="breadcrumbs">
      <For each={nodes()}>
        {(node, i) => (
          <>
            <button
              {...(i() === lastNodeIndex() ? { "aria-current": "page" } : {})}
              style={{
                color: node.color,
                cursor: "pointer",
              }}
              onClick={[props.setDiagramRootPath, node.targetPath]}
            >
              <span>{getDisplayName(node.name)}</span>
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
