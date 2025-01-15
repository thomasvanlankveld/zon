import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  JSX,
  useContext,
} from "solid-js";
import {
  arePathsEqual,
  getNodeByPath,
  groupSmallestNodes,
  Node,
  Path,
  withNode,
} from "../../utils/zon";

const DEFAULT_MAX_CHILDREN = 16;

/**
 * This technically not a Solid.js "store", but it does hold state
 */
function createReportStore(initialReportRoot: Node) {
  const [reportRootWithoutGroups, setReportRoot] =
    createSignal(initialReportRoot);

  // Path of the selected file
  const [selectedRootPath, setSelectedRootPath] = createSignal<Path | null>(
    null,
  );

  const defaultRootPath = createMemo(() =>
    reportRootWithoutGroups().path.slice(-1),
  );
  const diagramRootPath = createMemo(
    () => selectedRootPath() ?? defaultRootPath(),
  );

  const [maxChildren, setMaxChildren] = createSignal(DEFAULT_MAX_CHILDREN);
  function expandGroup() {
    setMaxChildren((prevMaxChildren) => prevMaxChildren + 30);
  }
  createEffect((prevRoot) => {
    if (prevRoot !== diagramRootPath()) {
      setMaxChildren(DEFAULT_MAX_CHILDREN);
    }
    return diagramRootPath();
  });

  const diagramRootWithoutGroups = createMemo(() =>
    getNodeByPath(reportRootWithoutGroups(), diagramRootPath()),
  );
  const diagramRoot = createMemo(() =>
    groupSmallestNodes(diagramRootWithoutGroups(), {
      minLines: Math.floor(diagramRootWithoutGroups().numberOfLines / 150),
      maxChildren: maxChildren(),
      // When the user expands the diagram root's group, we also want to show items that are smaller than minLines
      ignoreMinLinesForRoot: maxChildren() !== DEFAULT_MAX_CHILDREN,
    }),
  );
  const reportRoot = createMemo(() =>
    withNode(reportRootWithoutGroups(), diagramRoot()),
  );

  // Path of the hovered arc
  const [hoverArcPath, setHoverArcPath] = createSignal<Path | null>(null);

  // Path of the hovered list item
  const [hoverListPath, setHoverListPath] = createSignal<Path | null>(null);

  // Breadcrumb setup
  const breadcrumbPath = () => hoverArcPath() ?? diagramRootPath();

  // Diagram setup
  const highlightedDiagramPath = hoverListPath;

  // List setup
  const listRootPath = createMemo(() => hoverArcPath() ?? diagramRootPath());
  const highlightedListPath = hoverArcPath;
  const listRoot = createMemo(() =>
    listRootPath() != null
      ? getNodeByPath(reportRoot(), listRootPath())
      : reportRoot(),
  );
  const isListRootReportRoot = createMemo(() =>
    arePathsEqual(listRootPath(), reportRoot().path),
  );

  return {
    reportRoot,
    setReportRoot,
    setSelectedRootPath,
    breadcrumbPath,
    diagramRoot,
    diagramRootPath,
    highlightedDiagramPath,
    setHoverArcPath,
    listRoot,
    listRootPath,
    isListRootReportRoot,
    highlightedListPath,
    setHoverListPath,
    expandGroup,
  };
}

const ReportStoreContext = createContext();

type ReportStoreProviderProps = {
  reportRoot: Node;
  children: JSX.Element;
};

export function ReportStoreProvider(props: ReportStoreProviderProps) {
  // Ignoring lint warning. By instantiating here we guarantee that report root is always defined, and the
  // createEffect callback makes sure it's reactive
  // eslint-disable-next-line solid/reactivity
  const reportStore = createReportStore(props.reportRoot);

  createEffect(() => {
    reportStore.setReportRoot(props.reportRoot);
  });

  return (
    <ReportStoreContext.Provider value={reportStore}>
      {props.children}
    </ReportStoreContext.Provider>
  );
}

type ReportStore = ReturnType<typeof createReportStore>;

export function useReportStore(): ReportStore {
  return useContext(ReportStoreContext) as ReportStore;
}
