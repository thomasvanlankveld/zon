import { createEffect, createSignal } from "solid-js";
import type { Node } from "../../utils/zon.ts";
import Sunburst from "./Sunburst.tsx";
import ReportList from "./ReportList.tsx";

type ReportPageProps = {
  root: Node;
  path: string;
};

export default function ReportPage(props: ReportPageProps) {
  // Path of the selected file
  const [diagramRootPath, setDiagramRootPath] = createSignal<string | null>(
    null,
  );
  createEffect(() => setDiagramRootPath(props.root.path));

  const [hoverArcPath, setHoverArcPath] = createSignal<string | null>(null);

  // Path of the file for the hovered list item
  const [hoverListPath, setHoverListPath] = createSignal<string | null>(null);
  // TODO: Actually use hoverListPath
  createEffect(() => console.log(hoverListPath()));

  // TODO: Move "highlighted" into reactive state, so that SolidJS can update only the needed elements

  return (
    <main>
      {/* TODO: Add header, controls to select a different folder, and loading */}
      <p>
        Counted {props.root.numberOfLines} lines in {props.path}:
      </p>
      {/* TODO: Add line count? Maybe keep hashmap of all root descendants for fast lookup? */}
      <p>Hovering: {hoverArcPath() ?? "..."}</p>
      <div style={{ display: "flex" }}>
        <Sunburst root={props.root} setHoverArcPath={setHoverArcPath} />
        <ReportList
          root={props.root}
          listRootPath={hoverArcPath() || diagramRootPath()}
          setHoverListPath={setHoverListPath}
          setDiagramRootPath={setDiagramRootPath}
        />
      </div>
      {/* For debugging: */}
      {/* <pre>{JSON.stringify(props.root, null, 2)}</pre> */}
    </main>
  );
}
