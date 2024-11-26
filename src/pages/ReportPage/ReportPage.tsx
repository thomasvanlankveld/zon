import { createMemo, createSignal } from "solid-js";
import {
  getNodeByPath,
  groupSmallestNodes,
  withNode,
  type Node,
  type Path,
} from "../../utils/zon.ts";
import Sunburst from "./Sunburst.tsx";
import ReportList from "./ReportList.tsx";
import UploadButton from "../../components/UploadButton/UploadButton.tsx";
import Breadcrumbs from "./Breadcrumbs.tsx";

type ReportPageProps = {
  root: Node;
  countLinesInFolder: () => void;
};

export default function ReportPage(props: ReportPageProps) {
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
    <main
      style={{
        height: "100%",
        "max-height": "100%",
        "box-sizing": "border-box",
        padding: "2rem",
        display: "grid",
        gap: "1rem",
        "grid-template-rows": "min-content min-content 1fr",
        "grid-template-columns": "4fr 3fr",
        overflow: "hidden",
        "align-items": "stretch",
        "justify-items": "stretch",
      }}
    >
      <div
        style={{
          "grid-column": "span 2 / span 2",
          display: "flex",
          "justify-content": "space-between",
        }}
      >
        <h1>Zon</h1>
        <UploadButton countLinesInFolder={props.countLinesInFolder} />
      </div>
      <Breadcrumbs
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
        setHoverListPath={setHoverListPath}
        setSelectedRootPath={setSelectedRootPath}
      />
      {/* For debugging: */}
      {/* <pre>{JSON.stringify(props.root, null, 2)}</pre> */}
    </main>
  );
}
