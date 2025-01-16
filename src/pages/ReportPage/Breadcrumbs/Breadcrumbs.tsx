import { createMemo, For, Show } from "solid-js";
import {
  getNodesAlongPath,
  type Path,
  type Node,
  getDisplayName,
  arePathsEqual,
  NODE_TYPE,
} from "../../../utils/zon";
import { useI18n } from "../../../utils/i18n";
import resetButtonStyles from "../../../styles/reset-button.module.css";
import styles from "./Breadcrumbs.module.css";
import { useReportStore } from "../ReportPage.store";

type BreadcrumbsProps = {
  class?: string;
};

export default function Breadcrumbs(props: BreadcrumbsProps) {
  const { t } = useI18n();
  const { reportRoot, breadcrumbPath, navigate } = useReportStore();

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

  return (
    <nav class={props.class} aria-label={t("breadcrumbs.label")}>
      <For each={nodes()}>
        {(node, i) => (
          <>
            <button
              {...(i() === lastNodeIndex() ? { "aria-current": "page" } : {})}
              style={{
                "--default-color": node.colors.default,
                "--highlighted-color": node.colors.highlighted,
                "--pressed-color": node.colors.pressed,
              }}
              class={`${resetButtonStyles["reset-button"]} ${styles["breadcrumbs__breadcrumb-button"]}`}
              onClick={[navigate, node.targetPath]}
            >
              <span>{getDisplayName(node.name, t("group-name"))}</span>
            </button>
            <Show when={node.type === NODE_TYPE.FOLDER}>
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
