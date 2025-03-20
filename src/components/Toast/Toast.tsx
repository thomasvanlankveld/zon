import { createSignal, JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";
import ToastAction from "./ToastAction";

const copies = {
  // TODO: use this copy with sr-only
  close: "Close",
  dismiss: "Dismiss",
};

type ToastProps = {
  message: string;
  actions?: JSX.Element;
  closeButton?: boolean;
  dismissButton?: boolean;
};

export default function Toast(props: ToastProps) {
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
            gap: "1rem",
            background: "var(--clr-grey-060)",
            border: "1px solid var(--clr-grey-150)",
            "box-shadow": "0 0 1rem var(--clr-black)",
          }}
          class="card text-extra-small"
          data-card-size="extra-small"
        >
          <span>{props.message}</span>
          {props.closeButton && (
            <button onClick={() => setIsDismissed(true)}>X</button>
          )}
          <div
            style={{
              "grid-column": "span 2",
              "justify-self": "end",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            {props.actions}
            {props.dismissButton && (
              <ToastAction
                variant="secondary"
                onClick={() => setIsDismissed(true)}
              >
                {copies.dismiss}
              </ToastAction>
            )}
          </div>
        </div>
      </Portal>
    </Show>
  );
}
