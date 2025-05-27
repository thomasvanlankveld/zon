import { createSignal, JSX, Show } from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import { Check, Info, OctagonX, TriangleAlert, X } from "lucide-solid";
import { ValueOf } from "../../utils/type";
import Button from "../Button/Button";
import ToastAction from "./ToastAction";

const copies = {
  // TODO: use this copy with sr-only
  close: "Close",
  dismiss: "Dismiss",
};

export const ToastType = {
  Neutral: "neutral",
  Info: "info",
  Success: "success",
  Warning: "warning",
  Error: "error",
} as const;
export type ToastType = ValueOf<typeof ToastType>;

type ToastProps = {
  type: ToastType;
  message: string;
  actions?: JSX.Element;
  closeButton?: boolean;
  dismissButton?: boolean;
};

const TypeIconProps = {
  [ToastType.Neutral]: null,
  [ToastType.Info]: {
    component: Info,
    color: "var(--color-info)",
  },
  [ToastType.Success]: {
    component: Check,
    color: "var(--color-success)",
  },
  [ToastType.Warning]: {
    component: TriangleAlert,
    color: "var(--color-warning)",
  },
  [ToastType.Error]: {
    component: OctagonX,
    color: "var(--color-error)",
  },
};

export default function Toast(props: ToastProps) {
  const [isDismissed, setIsDismissed] = createSignal(false);

  const type = () => props.type;
  // const type = () => ToastType.Neutral;

  return (
    <Show when={!isDismissed()}>
      <Portal>
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            "max-width": "24rem",
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
          <div
            style={{
              display: "grid",
              "grid-template-columns": "auto 1fr",
              gap: "var(--spacing-m)",
            }}
          >
            <Show when={TypeIconProps[type()]}>
              {(iconProps) => (
                <Dynamic
                  component={iconProps().component}
                  color={iconProps().color}
                  size={20}
                />
              )}
            </Show>
            <span
              style={{
                "margin-block": "var(--spacing-3xs)",
                "overflow-wrap": "anywhere",
              }}
            >
              {props.message}
            </span>
          </div>
          <Show when={props.closeButton}>
            <Button
              variant="tertiary"
              onClick={() => setIsDismissed(true)}
              style={{
                "line-height": "var(--spacing-s)",
              }}
            >
              <X size={16} />
            </Button>
          </Show>
          <Show when={props.actions || props.dismissButton}>
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
          </Show>
        </div>
      </Portal>
    </Show>
  );
}
