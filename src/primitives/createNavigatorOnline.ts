import { createSignal, onCleanup, type Accessor } from "solid-js";

/**
 * Creates a readonly accessor that tracks whether the browser is online
 * @returns A readonly accessor that returns true when the browser is online, false when offline
 * @example
 * const isOnline = createNavigatorOnline();
 *
 * // Use in JSX
 * <div>Status: {isOnline() ? "Online" : "Offline"}</div>
 *
 * // Use in effects
 * createEffect(() => {
 *   if (isOnline()) {
 *     // Do something when online
 *   }
 * });
 */
export default function createNavigatorOnline(): Accessor<boolean> {
  const [isOnline, setIsOnline] = createSignal(navigator.onLine);

  function handleOnline() {
    setIsOnline(true);
  }

  function handleOffline() {
    setIsOnline(false);
  }

  // Set up event listeners
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Clean up event listeners when the component is disposed
  onCleanup(() => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  });

  return isOnline;
}
