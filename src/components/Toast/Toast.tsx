import {
  createSignal,
  JSX,
  Show,
  createMemo,
  onMount,
  onCleanup,
} from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import { Check, Info, OctagonX, TriangleAlert, X } from "lucide-solid";
import { useMouse } from "../../contexts/mouse";
import { ValueOf } from "../../utils/type";
import Button from "../Button/Button";
import ToastAction from "./ToastAction";
import styles from "./Toast.module.css";

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

type ToastTypeConfig = {
  icon:
    | typeof Info
    | typeof Check
    | typeof TriangleAlert
    | typeof OctagonX
    | null;
  color: string;
};

const ToastTypeConfig: Record<ToastType, ToastTypeConfig> = {
  [ToastType.Neutral]: {
    icon: null,
    color: "var(--color-neutral)",
  },
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

// Constants for toast timing
const TOAST_TIMING = {
  MIN_DURATION: 4000, // Minimum duration in ms
  MAX_DURATION: 8000, // Maximum duration in ms
  BASE_DURATION: 4000, // Base duration in ms
  CHARS_PER_SECOND: 14, // Reading speed in characters per second
  PROGRESS_HEIGHT: "3px", // Height of the progress bar
} as const;

/**
 * Calculates standardized dismiss duration based on message length
 * @param message The toast message
 * @returns Duration in milliseconds
 */
function calculateDismissDuration(message: string): number {
  const readingTime = (message.length / TOAST_TIMING.CHARS_PER_SECOND) * 1000;
  const totalDuration = TOAST_TIMING.BASE_DURATION + readingTime;

  return Math.min(
    Math.max(totalDuration, TOAST_TIMING.MIN_DURATION),
    TOAST_TIMING.MAX_DURATION,
  );
}

type ToastProps = {
  type: ToastType;
  message: string;
  actions?: JSX.Element;
  closeButton?: boolean;
  dismissButton?: boolean;
  autoDismiss?: boolean | number;
};

/**
 * A toast is a small notification that appears at the bottom of the screen. It can be used to display messages to the user.
 *
 * This component expects the mouse position to be provided by the `MouseProvider` component.
 *
 * @param props.type The type of toast to display
 * @param props.message The message to display in the toast
 * @param props.actions The actions to display in the toast
 * @param [props.closeButton] Default `false`. Whether to display a close button in the toast
 * @param [props.dismissButton] Default `false`. Whether to display a dismiss button in the toast
 * @param [props.autoDismiss] Default `false`. Use `false` to disable, and `true` to use automatic timing based on message length. Use a number for custom duration.
 */
export default function Toast(props: ToastProps) {
  const [isDismissed, setIsDismissed] = createSignal(false);
  const [wasToastHovered, setWasToastHovered] = createSignal(false);
  const mousePosition = useMouse();
  let toastElement: HTMLDivElement | undefined;
  let autoDismissTimeoutId: number | undefined;

  const type = () => props.type;
  // const type = () => ToastType.Neutral;
  // const type = () => ToastType.Info;
  // const type = () => ToastType.Success;
  // const type = () => ToastType.Warning;
  // const type = () => ToastType.Error;
  const typeConfig = () => ToastTypeConfig[type()];

  const autoDismissDuration = createMemo(() => {
    if (!props.autoDismiss) return 0;
    return typeof props.autoDismiss === "number"
      ? props.autoDismiss
      : calculateDismissDuration(props.message);
  });

  function maybeStartAutoDismiss() {
    // Only start auto-dismiss if it's enabled
    if (!props.autoDismiss) return;

    const rect = toastElement?.getBoundingClientRect();
    const pos = mousePosition();

    // Only start auto-dismiss if the mouse is outside the toast
    if (
      rect &&
      pos.x >= rect.left &&
      pos.x <= rect.right &&
      pos.y >= rect.top &&
      pos.y <= rect.bottom
    ) {
      setWasToastHovered(true);
      return;
    }

    // Start auto-dismiss
    autoDismissTimeoutId = window.setTimeout(() => {
      setIsDismissed(true);
    }, autoDismissDuration());
  }

  function cancelAutoDismiss() {
    if (autoDismissTimeoutId) {
      window.clearTimeout(autoDismissTimeoutId);
      autoDismissTimeoutId = undefined;
    }
  }

  onMount(maybeStartAutoDismiss);
  onCleanup(cancelAutoDismiss);

  function onToastMouseEnter() {
    cancelAutoDismiss();
    setWasToastHovered(true);
  }

  return (
    <Show when={!isDismissed()}>
      <Portal>
        <div
          ref={toastElement}
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
          class={`card text-extra-small ${styles.toast}`}
          data-card-size="extra-small"
          // TODO: Add a click handler to dismiss the toast
          onMouseEnter={onToastMouseEnter}
        >
          <Show when={props.autoDismiss && !wasToastHovered()}>
            <div class={styles.progressTrack}>
              <div
                class={styles.progressBar}
                data-animating="true"
                style={{
                  "animation-duration": `${autoDismissDuration()}ms`,
                  background: typeConfig().color,
                }}
              />
            </div>
          </Show>
          <div
            style={{
              display: "grid",
              "grid-template-columns": "auto 1fr",
              gap: "var(--spacing-m)",
            }}
          >
            <Show when={typeConfig().icon}>
              {(icon) => (
                <Dynamic
                  component={icon()}
                  color={typeConfig().color}
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
