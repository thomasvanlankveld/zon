# Animation

Experiment with animation in ListItem.tsx.

Has a few problems, but the combination of exponential smoothing and requestAnimationFrame works.

```jsx
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { JSX } from "solid-js/h/jsx-runtime";
import { useI18n } from "../../../utils/i18n";
import { getDisplayName, NODE_TYPE, type Node } from "../../../utils/zon";
import resetButtonStyles from "../../../styles/reset-button.module.css";
import styles from "./ListItem.module.css";

type ListItemProps = {
  component?: "button" | "span";
  class?: string;
  style?: JSX.CSSProperties;
  arrowDirection?: ArrowDirection;
  onMouseEnter?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  onMouseLeave?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  node: Node;
};

export const ARROW_DIRECTION = {
  LEFT: "left",
  RIGHT: "right",
} as const;
export type ArrowDirection =
  (typeof ARROW_DIRECTION)[keyof typeof ARROW_DIRECTION];

function areNumbersEqual(a: number, b: number, tolerance?: number) {
  tolerance ??= Math.min(Math.abs(a), Math.abs(b)) * Number.EPSILON;

  return Math.abs(a - b) < tolerance;
}

export default function ListItem(props: ListItemProps) {
  const { t, formatNumber } = useI18n();

  const [isHovered, setIsHovered] = createSignal(false);

  const targetWidth = createMemo(() => (isHovered() ? 100 : 0));
  const [visibleWidth, setVisibleWidth] = createSignal(0);
  const [time, setTime] = createSignal(Date.now());

  function animate() {
    requestAnimationFrame(() => {
      // position.x += (target - position.x) * (1 - exp(- dt * speed));
      const dt = Date.now() - time();
      setVisibleWidth(
        visibleWidth() +
          (targetWidth() - visibleWidth()) * (1 - Math.exp(-dt * 0.01)),
      );

      setTime(Date.now());

      if (!areNumbersEqual(targetWidth(), visibleWidth())) {
        animate();
      }
    });
  }

  createEffect((newIsHovered) => {
    if (newIsHovered !== isHovered()) {
      setTime(Date.now());
      animate();
    }

    return isHovered();
  });

  return (
    <div
      style={{ position: "relative", display: "flex", ...props.style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          background: "var(--base-color)",
          height: "var(--line-height)",
          "clip-path": `inset(0 ${100 - visibleWidth()}% 0 0)`,
          "z-index": -1,
        }}
      />

      <Dynamic
        component={props.component}
        class={`${styles["list-item"]} ${props.class}`}
        classList={{
          [resetButtonStyles["reset-button"]]: props.component === "button",
          [styles["list-item__button"]]: props.component === "button",
        }}
        style={{ flex: 1 }}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        onClick={props.onClick}
      >
        <span class={styles["list-item__display-name"]}>
          <Show when={props.arrowDirection === ARROW_DIRECTION.LEFT}>
            <span class={styles["list-item__arrow"]}>{"<- "}</span>
          </Show>
          {getDisplayName(props.node.name, t("group-name"))}
          <Show when={props.node.type === NODE_TYPE.FOLDER}>
            <span class={styles["list-item__folder-separator"]}> /</span>
          </Show>
          <Show when={props.arrowDirection === ARROW_DIRECTION.RIGHT}>
            <span class={styles["list-item__arrow"]}>{" ->"}</span>
          </Show>
        </span>
        <span class={styles["list-item__number-of-lines"]}>
          {t("list-item.number-of-lines", {
            numberOfLines: formatNumber(props.node.numberOfLines),
          })}
        </span>
      </Dynamic>
    </div>
  );
}
```

Sources:

- [My favourite animation trick: exponential smoothing | lisyarus blog](https://lisyarus.github.io/blog/posts/exponential-smoothing.html)
- [Clipping And Masking In CSS | CSS-Tricks](https://css-tricks.com/clipping-masking-css/)
