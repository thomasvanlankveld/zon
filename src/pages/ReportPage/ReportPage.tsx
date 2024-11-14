import { createEffect, createSignal } from "solid-js";
import type { Node } from "../../utils/zon.ts";
import Sunburst from "./Sunburst.tsx";
import ReportList from "./ReportList.tsx";
import UploadButton from "../../components/UploadButton.tsx";
import Breadcrumbs from "./Breadcrumbs.tsx";

type ReportPageProps = {
  root: Node;
  path: string;
  countLinesInFolder: () => void;
};

export default function ReportPage(props: ReportPageProps) {
  // Path of the selected file
  const [selectedDiagramRootPath, setDiagramRootPath] = createSignal<
    string | null
  >(null);
  const defaultRootPath = () => props.root.path.split("/").slice(-1)[0];
  const diagramRootPath = () => selectedDiagramRootPath() ?? defaultRootPath();

  const [hoverArcPath, setHoverArcPath] = createSignal<string | null>(null);

  // Path of the file for the hovered list item
  const [hoverListPath, setHoverListPath] = createSignal<string | null>(null);
  // TODO: Actually use hoverListPath
  createEffect(() => console.log(hoverListPath()));

  // TODO: Move "highlighted" into reactive state, so that SolidJS can update only the needed elements

  const breadcrumbPath = () => hoverArcPath() ?? diagramRootPath();

  return (
    <main>
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
      <div style={{ display: "flex" }}>
        <Sunburst root={props.root} setHoverArcPath={setHoverArcPath} />
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
