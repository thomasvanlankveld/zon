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
import resetButtonStyles from "../../../styles/reset-button.module.css";
import ListItem from "./ListItem";
import styles from "./ReportList.module.css";

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
    <div class={styles["report-list"]}>
      <ListItem
        component="h2"
        class={styles["report-list__heading"]}
        node={listRoot()}
      />
      {/* TODO: Maybe this shouldn't be a nav? Check https://a11y-style-guide.com/style-guide/section-navigation.html */}
      <nav
        class={styles["report-list__nav"]}
        aria-label={`${listRoot.name} content list`}
      >
        <For each={listNodes()}>
          {(child) => (
            <ListItem
              component="button"
              style={{
                "--base-color": child.colors.base,
                "--highlighted-color": child.colors.highlighted,
                "--pressed-color": child.colors.pressed,
              }}
              class={`${resetButtonStyles["reset-button"]} ${styles["report-list__list-item"]}`}
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
