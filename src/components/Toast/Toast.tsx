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

const TypeProps = {
  [ToastType.Info]: {
    icon: Info,
    color: "var(--color-info)",
  },
  [ToastType.Success]: {
    icon: Check,
    color: "var(--color-success)",
  },
  [ToastType.Warning]: {
    icon: TriangleAlert,
    color: "var(--color-warning)",
  },
  [ToastType.Error]: {
    icon: OctagonX,
    color: "var(--color-error)",
  },
};

export default function Toast(props: ToastProps) {
  const [isDismissed, setIsDismissed] = createSignal(false);

  const type = () => props.type;
  // const type = () => ToastType.Error;

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
          <div
            style={{
              display: "grid",
              "grid-template-columns": "auto 1fr",
              gap: "var(--spacing-m)",
            }}
          >
            <Dynamic
              component={TypeProps[type()].icon}
              color={TypeProps[type()].color}
              size={20}
            />
            <span style={{ "margin-top": "var(--spacing-3xs)" }}>
              {props.message}
            </span>
          </div>
          {props.closeButton && (
            <Button onClick={() => setIsDismissed(true)}>
              {/* <button onClick={() => setIsDismissed(true)}> */}
              <X size={16} />
              {/* </button> */}
            </Button>
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
