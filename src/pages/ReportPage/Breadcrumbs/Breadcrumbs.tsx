import { createMemo, For, type Setter, Show } from "solid-js";
import {
  getNodesAlongPath,
  type Path,
  type Node,
  getDisplayName,
  arePathsEqual,
} from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";
import resetButtonStyles from "../../../styles/reset-button.module.css";
import styles from "./Breadcrumbs.module.css";

type BreadcrumbsProps = {
  class?: string;
  root: Node;
  breadcrumbPath: Path;
  setSelectedRootPath: Setter<Path | null>;
};

export default function Breadcrumbs(props: BreadcrumbsProps) {
  const { t } = useI18n();

  function getTargetPath(node: Node): Path | null {
    const isReportRoot = arePathsEqual(node.path, props.root.path);
    return isReportRoot ? null : node.path;
  }

  const nodes = createMemo(() =>
    getNodesAlongPath(props.root, props.breadcrumbPath).map((node) => ({
      ...node,
      targetPath: getTargetPath(node),
    })),
  );
  const lastNodeIndex = () => nodes().length - 1;

  return (
    <nav class={props.class} aria-label={t("breadcrumbs.label")}>
      <For each={nodes()}>
        {(node, i) => (
          <>
            <button
              {...(i() === lastNodeIndex() ? { "aria-current": "page" } : {})}
              style={{
                "--base-color": node.colors.base,
                "--highlighted-color": node.colors.highlighted,
                "--pressed-color": node.colors.pressed,
              }}
              class={`${resetButtonStyles["reset-button"]} ${styles["breadcrumbs__breadcrumb-button"]}`}
              onClick={[props.setSelectedRootPath, node.targetPath]}
            >
              <span>{getDisplayName(node.name, t("group-name"))}</span>
            </button>
            <Show when={i() !== lastNodeIndex()}>
              <span class={styles.breadcrumbs__breadcrumb_separator}>
                {" / "}
              </span>
            </Show>
          </>
        )}
      </For>
    </nav>
  );
}
