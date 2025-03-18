import { createSignal, JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useBackgroundState } from "../Background/Background";

type ToastProps = {
  message: string;
  actions?: JSX.Element;
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
          <span>{props.message}</span>
          <button onClick={() => setIsDismissed(true)}>X</button>
          <div
            style={{
              "grid-column": "span 2",
              "justify-self": "end",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            {props.actions}
          </div>
        </div>
      </Portal>
    </Show>
  );
}
