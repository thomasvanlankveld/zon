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
  MIN_DURATION: 3000, // Minimum duration in ms
  MAX_DURATION: 8000, // Maximum duration in ms
  BASE_DURATION: 3000, // Base duration in ms
  CHARS_PER_SECOND: 20, // Reading speed in characters per second
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
  autoDismiss?: boolean | number; // Can be boolean to use standardized timing, or number for custom duration
};

export default function Toast(props: ToastProps) {
  const [isDismissed, setIsDismissed] = createSignal(false);
  const [wasHovered, setWasHovered] = createSignal(false);
  let timeoutId: number | undefined;

  const type = () => props.type;
  // const type = () => ToastType.Neutral;
  // const type = () => ToastType.Info;
  // const type = () => ToastType.Success;
  // const type = () => ToastType.Warning;
  // const type = () => ToastType.Error;
  const typeConfig = () => ToastTypeConfig[type()];

  const duration = createMemo(() => {
    if (!props.autoDismiss) return 0;
    return typeof props.autoDismiss === "number"
      ? props.autoDismiss
      : calculateDismissDuration(props.message);
  });

  onMount(() => {
    if (props.autoDismiss && !wasHovered()) {
      timeoutId = window.setTimeout(() => {
        setIsDismissed(true);
      }, duration());
    }
  });

  onCleanup(() => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  });

  const handleMouseEnter = () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    setWasHovered(true);
  };

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
          class={`card text-extra-small ${styles.toast}`}
          data-card-size="extra-small"
          onMouseEnter={handleMouseEnter}
        >
          <Show when={props.autoDismiss && !wasHovered()}>
            <div class={styles.progressTrack}>
              <div
                class={styles.progressBar}
                data-animating="true"
                style={{
                  "animation-duration": `${duration()}ms`,
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
