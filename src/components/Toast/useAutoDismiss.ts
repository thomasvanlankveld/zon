import {
  Accessor,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { useMouse } from "../../contexts/mouse";

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

type UseAutoDismissProps = {
  autoDismiss: Accessor<boolean | number | undefined>;
  message: Accessor<string>;
  element: Accessor<HTMLDivElement | undefined>;
  setIsDismissed: (isDismissed: boolean) => void;
};

/**
 * This hook is used to automatically dismiss an element after a certain amount of time.
 *
 * Requires the mouse position to be provided by the `MouseProvider` component.
 *
 * @param props.autoDismiss Whether to auto-dismiss the element. If `true`, the element will auto-dismiss after a certain amount of time. If `false`, the element will not auto-dismiss. If a number, the element will auto-dismiss after that number of milliseconds.
 * @param props.message The message to display in the element.
 * @param props.element The element to attach the auto-dismiss to.
 * @param props.setIsDismissed A function to set whether the element is dismissed.
 * @returns An object with the following properties:
 * - shouldShowProgressTrack: A function that returns whether to show the progress track. (computed)
 * - cancelAutoDismiss: A function to cancel the auto-dismiss.
 * - autoDismissDuration: A function that returns the duration of the auto-dismiss. (computed)
 */
export default function useAutoDismiss(props: UseAutoDismissProps) {
  const mousePosition = useMouse();
  const [wasAutoDismissCancelled, setWasAutoDismissCancelled] =
    createSignal(false);
  let autoDismissTimeoutId: number | undefined;

  /**
   * Returns the duration of the auto-dismiss. (computed)
   */
  const autoDismissDuration = createMemo(() => {
    if (!props.autoDismiss) return 0;
    return typeof props.autoDismiss === "number"
      ? props.autoDismiss
      : calculateDismissDuration(props.message());
  });

  /**
   * Starts the auto-dismiss timer if the element is not hovered.
   */
  function maybeStartAutoDismiss() {
    // Only start auto-dismiss if it's enabled
    if (!props.autoDismiss) return;

    const element = props.element();

    if (!element) {
      throw new Error("Auto-dismiss element is not defined");
    }

    const rect = element.getBoundingClientRect();
    const pos = mousePosition();

    // Only start auto-dismiss if the mouse is outside the toast
    if (
      rect &&
      pos.x >= rect.left &&
      pos.x <= rect.right &&
      pos.y >= rect.top &&
      pos.y <= rect.bottom
    ) {
      props.setIsDismissed(true);
      return;
    }

    // Start auto-dismiss
    // eslint-disable-next-line solid/reactivity
    autoDismissTimeoutId = window.setTimeout(() => {
      props.setIsDismissed(true);
    }, autoDismissDuration());
  }

  /**
   * Cancels the auto-dismiss timer.
   */
  function cancelAutoDismiss() {
    if (autoDismissTimeoutId) {
      window.clearTimeout(autoDismissTimeoutId);
      autoDismissTimeoutId = undefined;
    }
    setWasAutoDismissCancelled(true);
  }

  /**
   * Starts the auto-dismiss timer when the component mounts.
   */
  onMount(maybeStartAutoDismiss);

  /**
   * Cancels the auto-dismiss timer when the component unmounts.
   */
  onCleanup(cancelAutoDismiss);

  /**
   * Returns whether to show the progress track. (computed)
   */
  function shouldShowProgressTrack() {
    return props.autoDismiss() && !wasAutoDismissCancelled();
  }

  return {
    shouldShowProgressTrack,
    cancelAutoDismiss,
    autoDismissDuration,
  };
}
