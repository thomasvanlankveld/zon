import { createSignal, type Component } from "solid-js";
import type { Node } from "../utils/zon.ts";
import Sunburst from "../Sunburst.tsx";

type ReportPageProps = {
  root: Node;
  path: string;
};

const ReportPage: Component<ReportPageProps> = function ReportPage(props) {
  const [hoveredArcFilePath, setHoveredArcFilePath] = createSignal<
    string | null
  >(null);

  return (
    <main>
      {/* TODO: Add header, controls to select a different folder, and loading */}
      <p>
        Counted {props.root.numberOfLines} lines in {props.path}:
      </p>
      {/* TODO: Add line count? Maybe keep hashmap of all root descendants for fast lookup? */}
      <p>Hovering: {hoveredArcFilePath() ?? "..."}</p>
      <Sunburst
        root={props.root}
        setHoveredArcFilePath={setHoveredArcFilePath}
      />
      <pre>{JSON.stringify(props.root, null, 2)}</pre>
    </main>
  );
};

export default ReportPage;
