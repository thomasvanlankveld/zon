import { createSignal, JSX, Show } from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import { Check, Info, OctagonX, TriangleAlert, X } from "lucide-solid";
import { useI18n } from "../../contexts/i18n";
import { ValueOf } from "../../utils/type";
import Button from "../Button/Button";
import ToastAction from "./ToastAction";
import styles from "./Toast.module.css";
import useAutoDismiss from "./useAutoDismiss";

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
  const { t } = useI18n();

  const [isDismissed, setIsDismissed] = createSignal(false);
  const [toastElement, setToastElement] = createSignal<
    HTMLDivElement | undefined
  >(undefined);
  const autoDismiss = useAutoDismiss({
    autoDismiss: () => props.autoDismiss,
    message: () => props.message,
    element: toastElement,
    setIsDismissed,
  });

  const type = () => props.type;
  const typeConfig = () => ToastTypeConfig[type()];

  return (
    <Show when={!isDismissed()}>
      <Portal>
        <div
          ref={setToastElement}
          class={`card text-extra-small ${styles.toast}`}
          data-card-size="extra-small"
          // TODO: Add a click handler to dismiss the toast
          onMouseEnter={() => autoDismiss.cancelAutoDismiss()}
        >
          <Show when={autoDismiss.shouldShowProgressTrack()}>
            <div class={styles["toast__progress-track"]}>
              <div
                class={styles["toast__progress-bar"]}
                data-animating="true"
                style={{
                  "animation-duration": `${autoDismiss.autoDismissDuration()}ms`,
                  "--progress-bar-color": typeConfig().color,
                }}
              />
            </div>
          </Show>
          <div class={styles["toast__content"]}>
            <Show when={typeConfig().icon}>
              {(icon) => (
                <Dynamic
                  component={icon()}
                  color={typeConfig().color}
                  size={20}
                />
              )}
            </Show>
            <span class={styles["toast__message"]}>{props.message}</span>
          </div>
          <Show when={props.closeButton}>
            <Button
              variant="tertiary"
              onClick={() => setIsDismissed(true)}
              classList={{
                [styles["toast__close-button"]]: true,
              }}
            >
              <span class="screen-reader-only">{t("close.action")}</span>
              <X size={16} />
            </Button>
          </Show>
          <Show when={props.actions || props.dismissButton}>
            <div class={styles["toast__actions"]}>
              {props.actions}
              {props.dismissButton && (
                <ToastAction
                  variant="secondary"
                  onClick={() => setIsDismissed(true)}
                >
                  {t("dismiss.action")}
                </ToastAction>
              )}
            </div>
          </Show>
        </div>
      </Portal>
    </Show>
  );
}
