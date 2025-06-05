import { JSX } from "solid-js";
import styles from "./Button.module.css";

export type ButtonProps = {
  children: JSX.Element;
  onClick?: () => void;
  type?: "submit" | "reset" | "button";
  // TODO: 'destructive' variant
  variant?: "primary" | "secondary" | "tertiary" | "shiny";
  size?: "small" | "medium" | "large";
  style?: JSX.CSSProperties;
};

export default function Button(props: ButtonProps) {
  const variant = () => props.variant ?? "primary";
  const size = () => props.size ?? "medium";
  const type = () => props.type ?? "button";

  return (
    <button
      style={props.style}
      classList={{
        [styles.button]: true,
        glimmer: variant() === "shiny",
        glow: variant() === "shiny",
      }}
      type={type()}
      onClick={() => props.onClick?.()}
      data-variant={variant()}
      data-size={size()}
    >
      {props.children}
    </button>
  );
}
