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
  getPathString,
} from "../../../utils/zon";
import styles from "../../../styles/reset-button.module.css";
import ListItem from "./ListItem";

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
    <div style={{ "overflow-x": "hidden" }}>
      <ListItem
        component="h4"
        style={{
          "margin-top": "0",
          "margin-bottom": "var(--line-height)",
          color: "white",
          "font-weight": "normal",
        }}
        node={listRoot()}
      />
      {/* TODO: Maybe this shouldn't be a nav? Check https://a11y-style-guide.com/style-guide/section-navigation.html */}
      <nav
        style={{ display: "grid", "overflow-x": "hidden" }}
        aria-label={`${listRoot.name} content list`}
      >
        <For each={listNodes()}>
          {(child) => (
            <ListItem
              component="button"
              style={{
                margin: 0,
                color: child.colors.base,
                cursor: "pointer",
              }}
              class={styles["reset-button"]}
              node={child}
              onMouseEnter={[props.setHoverListPath, child.path]}
              onMouseLeave={[props.setHoverListPath, null]}
              onClick={[onListItemClick, child]}
            />
          )}
        </For>
      </nav>
    </div>
  );
}
