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
  getParentPath,
  arePathsEqual,
  getDisplayName,
} from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";
import ListItem from "./ListItem/ListItem";
import { ARROW_DIRECTION } from "./ListItem/DisplayName";
import styles from "./ReportList.module.css";
import { getBaseColor } from "../../../utils/zon/color";

type ReportListProps = {
  root: Node;
  listRootPath: Path | null;
  highlightedPath: Path | null;
  setHoverListPath: Setter<Path | null>;
  setSelectedRootPath: Setter<Path | null>;
};

export default function ReportList(props: ReportListProps) {
  const { t } = useI18n();

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

  const isReportRoot = createMemo(() =>
    arePathsEqual(listRoot().path, props.root.path),
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

  function onHeadingClick() {
    const target = isReportRoot() ? null : getParentPath(listRoot().path);

    props.setSelectedRootPath(target);
  }

  function onListItemClick(node: Node) {
    if (node.type === NODE_TYPE.GROUP) {
      setShowGroup(true);
    } else if (node.type === NODE_TYPE.FOLDER) {
      props.setSelectedRootPath(node.path);
    }
  }

  function getChildArrowDirection(node: Node) {
    if (node.type === NODE_TYPE.FOLDER) {
      return ARROW_DIRECTION.RIGHT;
    }

    if (node.type === NODE_TYPE.GROUP) {
      return ARROW_DIRECTION.DOWN;
    }

    return undefined;
  }

  return (
    <div class={styles["report-list"]}>
      {/* TODO: Maybe this shouldn't be a nav? Check https://a11y-style-guide.com/style-guide/section-navigation.html */}
      <nav
        class={styles["report-list__nav"]}
        aria-label={t("report-list.nav.label", {
          name: getDisplayName(listRoot().name, t("group-name")),
        })}
      >
        <ListItem
          component={isReportRoot() ? "span" : "button"}
          style={{
            "--base-color": getBaseColor(
              listRoot().colors,
              listRoot().path,
              props.highlightedPath,
            ),
            "--highlighted-color": listRoot().colors.highlighted,
            "--pressed-color": listRoot().colors.pressed,
          }}
          class={styles["report-list__heading"]}
          arrowDirection={isReportRoot() ? undefined : ARROW_DIRECTION.LEFT}
          node={listRoot()}
          onMouseEnter={[props.setHoverListPath, listRoot().path]}
          onMouseLeave={[props.setHoverListPath, null]}
          onClick={() => onHeadingClick()}
        />
        <For each={listNodes()}>
          {(child) => (
            <ListItem
              component={
                child.type === NODE_TYPE.FOLDER ||
                child.type === NODE_TYPE.GROUP
                  ? "button"
                  : "span"
              }
              style={{
                "--base-color": child.colors.default,
                "--highlighted-color": child.colors.highlighted,
                "--pressed-color": child.colors.pressed,
              }}
              arrowDirection={getChildArrowDirection(child)}
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
