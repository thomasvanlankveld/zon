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
  getDisplayName,
} from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";
import ListItem from "./ListItem/ListItem";
import styles from "./ReportList.module.css";
import ListHeading from "./ListItem/ListHeading";

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

  return (
    <div class={styles["report-list"]}>
      {/* TODO: Maybe this shouldn't be a nav? Check https://a11y-style-guide.com/style-guide/section-navigation.html */}
      <nav
        class={styles["report-list__nav"]}
        aria-label={t("report-list.nav.label", {
          name: getDisplayName(listRoot().name, t("group-name")),
        })}
      >
        <ListHeading
          listRoot={listRoot()}
          reportRootPath={props.root.path}
          highlightedPath={props.highlightedPath}
          setHoverListPath={props.setHoverListPath}
          setSelectedRootPath={props.setSelectedRootPath}
        />
        <For each={listNodes()}>
          {(child) => (
            <ListItem
              node={child}
              setHoverListPath={props.setHoverListPath}
              setSelectedRootPath={props.setSelectedRootPath}
              setShowGroup={setShowGroup}
            />
          )}
        </For>
      </nav>
    </div>
  );
}
