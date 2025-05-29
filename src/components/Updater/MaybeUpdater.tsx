import { Show } from "solid-js";
import { TARGET, useMeta } from "../../contexts/meta";
import Updater from "./Updater";

export default function MaybeUpdater() {
  const meta = useMeta();

  return (
    <Show when={meta.target === TARGET.DESKTOP}>
      <Updater />
    </Show>
  );
}
