// import { A } from "@solidjs/router";
// import Routes from "../../../routes.ts";
import { createMemo, createSignal, For, Show } from "solid-js";
import {
  getNodesAlongPath,
  type Path,
  type Node,
  getDisplayName,
  arePathsEqual,
  isFolder,
  isChildPath,
  GetNodeError,
} from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";
import styles from "./Breadcrumbs.module.css";
import { useReportState } from "../ReportPage.state";

type BreadcrumbsProps = {
  class?: string;
};

export default function Breadcrumbs(props: BreadcrumbsProps) {
  const { t } = useI18n();
  const {
    reportRoot,
    diagramRootPath,
    breadcrumbPath,
    navigate,
    getNodeTextColors,
  } = useReportState();

  const [hoverPath, setHoverPath] = createSignal<Path | null>(null);

  function getTargetPath(node: Node): Path | null {
    const isReportRoot = arePathsEqual(node.path, reportRoot().path);
    return isReportRoot ? null : node.path;
  }

  const nodesAlongPath = createMemo<Node[]>((prev) => {
    try {
      return getNodesAlongPath(reportRoot(), breadcrumbPath());
    } catch (error) {
      // During the diagram's animation, it's possible to hover over a node that does not exist in the new tree. In
      // that case, we just keep showing the most recent breadcrumb trail.
      if (error instanceof GetNodeError && prev !== undefined) {
        return prev;
      } else {
        throw error;
      }
    }
  });
  const nodes = createMemo(() =>
    nodesAlongPath().map((node) => ({
      ...node,
      targetPath: getTargetPath(node),
    })),
  );
  const lastNodeIndex = () => nodes().length - 1;

  function deemphasize(node: Node) {
    if (!arePathsEqual(diagramRootPath(), breadcrumbPath())) {
      return !isChildPath(diagramRootPath(), node.path, { inclusive: true });
    }

    if (hoverPath() == null) {
      return false;
    }

    return !arePathsEqual(hoverPath(), node.path);
  }

  return (
    <nav
      // Can't block class on breadcrumbs__space element, because then it would cover the entire min-height
      class={`${styles["breadcrumbs__space"]} ${props.class}`}
      aria-label={t("breadcrumbs.label")}
    >
      <div class="block">
        {/* Can't put block class on breadcrumbs__content element, because you'd see the text spill out after ellipsis */}
        <div class={styles["breadcrumbs__content"]}>
          {/* <A
          style={{ color: "var(--color-text-group-regular)" }}
          href={Routes.Home.Matcher}
        >
          back
        </A> */}

          {/* <div> */}
          <For each={nodes()}>
            {(node, i) => {
              const colors = getNodeTextColors(node);

              return (
                <button
                  {...(i() === lastNodeIndex()
                    ? { "aria-current": "page" }
                    : {})}
                  style={{
                    "--color-breadcrumb-regular": colors.regular,
                    "--color-breadcrumb-active": colors.active,
                    "--color-breadcrumb-deemphasize": colors.deemphasize,
                  }}
                  class={styles["breadcrumbs__breadcrumb-button"]}
                  data-deemphasize={deemphasize(node)}
                  onMouseEnter={[setHoverPath, node.path]}
                  onMouseLeave={[setHoverPath, null]}
                  onClick={[navigate, node.targetPath]}
                >
                  <span>{getDisplayName(node.name, t("group-name"))}</span>
                  <Show when={isFolder(node)}>
                    <span class={styles["breadcrumbs__breadcrumb-separator"]}>
                      /
                    </span>
                  </Show>
                </button>
              );
            }}
          </For>
          {/* </div> */}
        </div>
      </div>
    </nav>
  );
}
