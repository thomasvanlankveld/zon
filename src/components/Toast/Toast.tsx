import { createSignal, JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useBackgroundState } from "../Background/Background";

type ToastProps = {
  children: JSX.Element;
};

export default function Toast(props: ToastProps) {
  const backgroundState = useBackgroundState();
  const [isDismissed, setIsDismissed] = createSignal(false);

  return (
    <Show when={!isDismissed()}>
      <Portal>
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            "max-width": "22rem",
            width: "100%",
            display: "grid",
            "grid-template-columns": "1fr auto",
            "justify-content": "space-between",
            "align-items": "start",
            gap: "0.5rem",
            // 0.375 gets us the rainbow color at the bottom right corner of the screen
            "--glow-background": backgroundState.getColor(0.375),
            "--glow-opacity": "0.25",
            "--glow-blur": "3rem",
          }}
          class="card text-extra-small glow"
          data-card-size="extra-small"
        >
          <div>{props.children}</div>
          <button onClick={() => setIsDismissed(true)}>X</button>
        </div>
      </Portal>
    </Show>
  );
}
