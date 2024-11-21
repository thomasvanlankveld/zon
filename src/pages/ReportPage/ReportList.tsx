import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type Setter,
} from "solid-js";
import {
  getNodeByPath,
  NODE_TYPE,
  type Path,
  type Node,
  getDisplayName,
  getPathString,
} from "../../utils/zon";
import styles from "../../styles/reset-button.module.css";

type ReportListProps = {
  root: Node;
  listRootPath: Path | null;
  setHoverListPath: Setter<Path | null>;
  setSelectedRootPath: Setter<Path | null>;
};

export default function ReportList(props: ReportListProps) {
  const [showGroup, setShowGroup] = createSignal(false);

  createEffect((prevRoot) => {
    if (prevRoot !== props.listRootPath) {
      setShowGroup(false);
    }
    return props.listRootPath;
  });

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

    if (root.type === NODE_TYPE.GROUP) {
      return root.groupedChildren;
    }

    if (root.type !== NODE_TYPE.FOLDER) {
      throw new Error(
        `Node "${getPathString(root.path)}" has unknown type ${root.type.toString()}`,
      );
    }

    const lastChild = root.children.at(-1);

    if (lastChild?.type !== NODE_TYPE.GROUP || !showGroup()) {
      return root.children;
    }

    const directChildren = root.children.slice(0, -1);
    const { groupedChildren } = lastChild;

    return [...directChildren, ...groupedChildren];
  };

  function onListItemClick(node: Node) {
    if (node.type === NODE_TYPE.GROUP) {
      setShowGroup(true);
    } else if (node.type === NODE_TYPE.FOLDER) {
      props.setSelectedRootPath(node.path);
    }
  }

  return (
    <div style={{ flex: "1 1 0%" }}>
      <h4
        style={{
          color: "white",
          "margin-bottom": "22px",
          "font-weight": "normal",
          display: "flex",
          "justify-content": "space-between",
        }}
      >
        <span>{getDisplayName(listRoot().name)}</span>
        <span>{listRoot().numberOfLines} lines</span>
      </h4>
      <nav
        style={{ display: "grid" }}
        aria-label={`${listRoot.name} content list`}
      >
        <For each={listNodes()}>
          {(child) => (
            <button
              style={{
                color: child.colors.base,
                cursor: "pointer",
                display: "flex",
                "justify-content": "space-between",
                margin: 0,
              }}
              class={styles["reset-button"]}
              onMouseEnter={[props.setHoverListPath, child.path]}
              onMouseLeave={[props.setHoverListPath, null]}
              onClick={[onListItemClick, child]}
            >
              <span>{getDisplayName(child.name)}</span>
              <span>{child.numberOfLines} lines</span>
            </button>
          )}
        </For>
      </nav>
    </div>
  );
}
