import {
  batch,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  JSX,
  useContext,
} from "solid-js";
import {
  arePathsEqual,
  Colors,
  getNodeByPath,
  groupSmallestNodes,
  isGroup,
  LINE_TYPE,
  Node,
  Path,
  rainbow,
  TEXT_GROUP_COLORS,
  TEXT_ROOT_COLORS,
  withNode,
} from "../../utils/zon";
import { LanguageType } from "../../utils/tokei";

const DEFAULT_MAX_CHILDREN = 14;

/**
 * Holds the report page's shared state
 */
function createReportState(initialReportRoot: Node) {
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
  const [hoverListLineType, setHoverListLineType] =
    createSignal<LINE_TYPE | null>(null);
  const [hoverListLanguage, setHoverListLanguage] =
    createSignal<LanguageType | null>(null);

  // Breadcrumb setup
  const breadcrumbPath = () => hoverArcPath() ?? diagramRootPath();

  // Diagram setup
  const highlightedDiagramPath = () => hoverListPath() ?? hoverArcPath();
  const highlightedDiagramLineType = hoverListLineType;
  const highlightedDiagramLanguage = hoverListLanguage;

  /**
   * Whether the arc for the given node should be highlighted or not, as a pure function
   */
  function isArcHighlightedPure(
    node: Node,
    highlightedPath: Path | null,
    highlightedLineType: LINE_TYPE | null,
    highlightedLanguage: LanguageType | null,
  ): boolean {
    const isPathHighlighted = arePathsEqual(highlightedPath, node.path);
    const isLineTypeHighlighted =
      highlightedLineType != null &&
      node.lineTypes[highlightedLineType].numberOfLines > 0;
    const isLanguageHighlighted =
      highlightedLanguage != null &&
      (node.languages[highlightedLanguage]?.numberOfLines ?? 0) > 0;

    return isPathHighlighted || isLineTypeHighlighted || isLanguageHighlighted;
  }

  /**
   * Whether the arc for the given node should be highlighted or not
   */
  function isArcHighlighted(node: Node) {
    return isArcHighlightedPure(
      node,
      highlightedDiagramPath(),
      highlightedDiagramLineType(),
      highlightedDiagramLanguage(),
    );
  }

  /**
   * An arc is deemphasized when other arcs are highlighted
   */
  function isArcDeemphasized(node: Node) {
    const isNothingHighlighted =
      highlightedDiagramPath() == null &&
      highlightedDiagramLineType() == null &&
      highlightedDiagramLanguage() == null;

    if (isNothingHighlighted) {
      return false;
    }

    return !isArcHighlightedPure(
      node,
      highlightedDiagramPath(),
      highlightedDiagramLineType(),
      highlightedDiagramLanguage(),
    );
  }

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

  // TODO: Maybe move this to a separate file?
  /**
   * Get a node's text colors
   */
  function getNodeTextColors(node: Node): Colors {
    if (arePathsEqual(node.path, reportRoot().path)) {
      return TEXT_ROOT_COLORS;
    }

    if (isGroup(node)) {
      return TEXT_GROUP_COLORS;
    }

    return rainbow(node.colorValue);
  }

  // Clearing the hovered paths is not just for usability. Setting the selected root path and expanding the max children
  // are interactions that can cause groups to cease to exist. By clearing hovered paths, we prevent the breadcrumbs
  // from crashing because they target a non-existing group.
  function navigate(path: Path | null) {
    batch(() => {
      setSelectedRootPath(path);
      setHoverArcPath(null);
      setHoverListPath(null);
    });
  }
  function expandGroup() {
    batch(() => {
      setMaxChildren((prevMaxChildren) => prevMaxChildren + 30);
      setHoverArcPath(null);
      setHoverListPath(null);
    });
  }

  return {
    reportRoot,
    setReportRoot,
    navigate,
    breadcrumbPath,
    diagramRoot,
    diagramRootPath,
    isArcHighlighted,
    isArcDeemphasized,
    setHoverArcPath,
    listRoot,
    listRootPath,
    isListRootReportRoot,
    highlightedListPath,
    hoverListPath,
    setHoverListPath,
    hoverListLineType,
    setHoverListLineType,
    hoverListLanguage,
    setHoverListLanguage,
    getNodeTextColors,
    expandGroup,
  };
}

const ReportStateContext = createContext();

type ReportStateProviderProps = {
  reportRoot: Node;
  children: JSX.Element;
};

export function ReportStoreProvider(props: ReportStateProviderProps) {
  // Ignoring lint warning. By instantiating here we guarantee that report root is always defined, and the
  // `createEffect` callback makes sure it's reactive.
  // eslint-disable-next-line solid/reactivity
  const reportState = createReportState(props.reportRoot);

  createEffect(() => {
    reportState.setReportRoot(props.reportRoot);
  });

  return (
    <ReportStateContext.Provider value={reportState}>
      {props.children}
    </ReportStateContext.Provider>
  );
}

type ReportState = ReturnType<typeof createReportState>;

export function useReportState(): ReportState {
  return useContext(ReportStateContext) as ReportState;
}
