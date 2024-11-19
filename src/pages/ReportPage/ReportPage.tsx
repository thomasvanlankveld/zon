import { createEffect, createSignal } from "solid-js";
import type { Node, Path } from "../../utils/zon.ts";
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
  const [selectedDiagramRootPath, setDiagramRootPath] =
    createSignal<Path | null>(null);
  const defaultRootPath = () => props.root.path.slice(-1);
  const diagramRootPath = () => selectedDiagramRootPath() ?? defaultRootPath();

  const [hoverArcPath, setHoverArcPath] = createSignal<Path | null>(null);

  // Path of the file for the hovered list item
  const [hoverListPath, setHoverListPath] = createSignal<Path | null>(null);
  // TODO: Actually use hoverListPath
  createEffect(() => console.log("hoverListPath", hoverListPath()));

  // TODO: Move "highlighted" into reactive state, so that SolidJS can update only the needed elements

  const breadcrumbPath = () => hoverArcPath() ?? diagramRootPath();

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
        root={props.root}
        path={breadcrumbPath()}
        setDiagramRootPath={setDiagramRootPath}
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
          root={props.root}
          diagramRootPath={diagramRootPath()}
          setHoverArcPath={setHoverArcPath}
          setDiagramRootPath={setDiagramRootPath}
        />
        <ReportList
          root={props.root}
          listRootPath={hoverArcPath() ?? diagramRootPath()}
          setHoverListPath={setHoverListPath}
          setDiagramRootPath={setDiagramRootPath}
        />
      </div>
      {/* For debugging: */}
      {/* <pre>{JSON.stringify(props.root, null, 2)}</pre> */}
    </main>
  );
}
