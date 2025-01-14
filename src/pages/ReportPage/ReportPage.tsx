import { createMemo, createSignal } from "solid-js";
import {
  getNodeByPath,
  groupSmallestNodes,
  withNode,
  type Node,
  type Path,
} from "../../utils/zon";
import { useI18n } from "../../utils/i18n.tsx";
import UploadButton from "../../components/UploadButton/UploadButton.tsx";
import Sunburst from "./Sunburst/Sunburst.tsx";
import ReportList from "./ReportList/ReportList.tsx";
import Breadcrumbs from "./Breadcrumbs/Breadcrumbs.tsx";
import styles from "./ReportPage.module.css";

type ReportPageProps = {
  root: Node;
  countLinesInFolder: () => void;
};

export default function ReportPage(props: ReportPageProps) {
  const { t } = useI18n();

  // Path of the selected file
  const [selectedRootPath, setSelectedRootPath] = createSignal<Path | null>(
    null,
  );
  const defaultRootPath = () => props.root.path.slice(-1);
  const diagramRootPath = createMemo(
    () => selectedRootPath() ?? defaultRootPath(),
  );

  const diagramRoot = createMemo(() =>
    getNodeByPath(props.root, diagramRootPath()),
  );
  const groupedDiagramRoot = createMemo(() =>
    groupSmallestNodes(diagramRoot(), {
      minLines: Math.floor(diagramRoot().numberOfLines / 150),
      maxChildren: 16,
    }),
  );
  const groupedReportRoot = createMemo(() =>
    withNode(props.root, groupedDiagramRoot()),
  );

  // Path of the hovered arc
  const [hoverArcPath, setHoverArcPath] = createSignal<Path | null>(null);

  // Path of the hovered list item
  const [hoverListPath, setHoverListPath] = createSignal<Path | null>(null);

  const breadcrumbPath = () => hoverArcPath() ?? diagramRootPath();

  return (
    <main class={styles["report-page"]}>
      <div class={styles["report-page__header"]}>
        <h1>{t("app.title")}</h1>
        <UploadButton countLinesInFolder={props.countLinesInFolder} />
      </div>
      <Breadcrumbs
        class={styles["report-page__breadcrumbs"]}
        root={groupedReportRoot()}
        breadcrumbPath={breadcrumbPath()}
        setSelectedRootPath={setSelectedRootPath}
      />
      <Sunburst
        root={groupedReportRoot()}
        diagramRootPath={diagramRootPath()}
        highlightedPath={hoverListPath()}
        setHoverArcPath={setHoverArcPath}
        setSelectedRootPath={setSelectedRootPath}
      />
      <ReportList
        root={groupedReportRoot()}
        listRootPath={hoverArcPath() ?? diagramRootPath()}
        highlightedPath={hoverArcPath()}
        setHoverListPath={setHoverListPath}
        setSelectedRootPath={setSelectedRootPath}
      />
      {/* For debugging: */}
      {/* <pre>{JSON.stringify(props.root, null, 2)}</pre> */}
    </main>
  );
}
