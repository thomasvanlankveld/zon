import { Show } from "solid-js";
import { TARGET, useMeta } from "../../contexts/meta";
import Updater from "./Updater";

/**
 * Wraps the Updater component, and  only renders it if the target is desktop.
 *
 * This way, the app does not crash because we're calling APIs that only work on desktop.
 */
export default function MaybeUpdater() {
  const meta = useMeta();

  return (
    <Show when={meta.target === TARGET.DESKTOP}>
      <Updater />
    </Show>
  );
}
