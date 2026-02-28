import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { createContext, createSignal, type JSX, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { LINE_TYPE, type Node, createTree } from "../utils/zon";
import type { Languages } from "../utils/tokei.ts";
import { useUpdateContext } from "./update";

export type ReportsContextValue = {
  reports: Record<string, Node>;
  setReport: (path: string, root: Node) => void;
  removeReport: (path: string) => void;
  countingPath: () => string | null;
  countLinesInFolder: () => Promise<string | null>;
};

const ReportsContext = createContext<ReportsContextValue | undefined>(
  undefined,
);

type ReportsProviderProps = {
  children: JSX.Element;
};

/**
 * Provides report state (store of reports by path, counting path signal)
 * and the countLinesInFolder flow. Must live inside UpdateProvider so that
 * countLinesInFolder can guard on isPendingRestart in step 3.
 */
export function ReportsProvider(props: ReportsProviderProps) {
  const updateCtx = useUpdateContext();
  const [reports, setReports] = createStore<Record<string, Node>>({});
  const [countingPath, setCountingPath] = createSignal<string | null>(null);

  function setReport(path: string, root: Node) {
    setReports(path, root);
  }

  function removeReport(path: string) {
    setReports(path, undefined!);
  }

  /**
   * Opens a directory picker, runs the backend line count for the chosen folder,
   * builds the report tree, and stores it. While running, {@link countingPath}
   * is set so the UI can show progress. Returns the chosen path on success, or
   * null if the user cancelled.
   */
  async function countLinesInFolder(): Promise<string | null> {
    if (updateCtx.isPendingRestart()) {
      throw new Error(
        "countLinesInFolder must not be called while a restart is pending",
      );
    }

    const path = await open({
      multiple: false,
      directory: true,
    });

    if (path == null) {
      return null;
    }

    setCountingPath(path);

    const languages = await invoke<Languages>("count_lines", { path });
    const reportRoot = createTree(path, languages, [
      LINE_TYPE.BLANKS,
      LINE_TYPE.CODE,
      LINE_TYPE.COMMENTS,
    ]);

    setReport(path, reportRoot);
    setCountingPath(null);

    return path;
  }

  const value: ReportsContextValue = {
    reports,
    setReport,
    removeReport,
    countingPath,
    countLinesInFolder,
  };

  return (
    <ReportsContext.Provider value={value}>
      {props.children}
    </ReportsContext.Provider>
  );
}

/**
 * Get the reports context (report store, counting state, countLinesInFolder).
 *
 * @returns {ReportsContextValue} Report state and actions
 */
export function useReportsContext(): ReportsContextValue {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error("useReportsContext must be used within a ReportsProvider");
  }
  return context;
}
