import { createMemo, createSignal, For, Show } from "solid-js";
import {
  getNodesAlongPath,
  type Path,
  type Node,
  getDisplayName,
  arePathsEqual,
  isFolder,
  isChildPath,
  getNodeStaticTextColors,
} from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";
import styles from "./Breadcrumbs.module.css";
import { useReportState } from "../ReportPage.state";

type BreadcrumbsProps = {
  class?: string;
};

export default function Breadcrumbs(props: BreadcrumbsProps) {
  const { t } = useI18n();
  const { reportRoot, diagramRootPath, breadcrumbPath, navigate } =
    useReportState();

  const [hoverPath, setHoverPath] = createSignal<Path | null>(null);

  function getTargetPath(node: Node): Path | null {
    const isReportRoot = arePathsEqual(node.path, reportRoot().path);
    return isReportRoot ? null : node.path;
  }

  const nodes = createMemo(() =>
    getNodesAlongPath(reportRoot(), breadcrumbPath()).map((node) => ({
      ...node,
      targetPath: getTargetPath(node),
    })),
  );
  const lastNodeIndex = () => nodes().length - 1;

  function getColors(node: Node) {
    return getNodeStaticTextColors(node, reportRoot().path);
  }

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
    <nav class={props.class} aria-label={t("breadcrumbs.label")}>
      <For each={nodes()}>
        {(node, i) => {
          const colors = getColors(node);

          return (
            <button
              {...(i() === lastNodeIndex() ? { "aria-current": "page" } : {})}
              style={{
                "--color-node-regular": colors.regular,
                "--color-node-active": colors.press,
                "--color-node-deemphasize":
                  colors?.dim ?? "var(--color-text-deemphasize)",
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
    </nav>
  );
}
