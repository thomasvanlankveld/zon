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
import UploadButton from "../../components/UploadButton.tsx";
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
      maxChildren: 11, // TODO: Depend on list height?
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
  const highlightedPath = () => hoverListPath() ?? hoverArcPath();

  return (
    <main
      style={{
        height: "100%",
        "max-height": "100%",
        "box-sizing": "border-box",
        padding: "1rem",
        display: "grid",
        "grid-auto-rows": "min-content min-content 1fr",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", "justify-content": "space-between" }}>
        <h1>Zon</h1>
        <UploadButton countLinesInFolder={props.countLinesInFolder} />
      </div>
      {/* TODO: Add line count? Maybe keep hashmap of all root descendants for fast lookup? */}
      <Breadcrumbs
        root={groupedReportRoot()}
        breadcrumbPath={breadcrumbPath()}
        setSelectedRootPath={setSelectedRootPath}
      />
      {/* TODO: Fix scrolling down the list */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          "align-items": "stretch",
          overflow: "hidden",
        }}
      >
        <Sunburst
          root={groupedReportRoot()}
          diagramRootPath={diagramRootPath()}
          highlightedPath={highlightedPath()}
          setHoverArcPath={setHoverArcPath}
          setSelectedRootPath={setSelectedRootPath}
        />
        <ReportList
          root={groupedReportRoot()}
          listRootPath={hoverArcPath() ?? diagramRootPath()}
          setHoverListPath={setHoverListPath}
          setSelectedRootPath={setSelectedRootPath}
        />
      </div>
      {/* For debugging: */}
      {/* <pre>{JSON.stringify(props.root, null, 2)}</pre> */}
    </main>
  );
}
