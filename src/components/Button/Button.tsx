import { JSX } from "solid-js";
import styles from "./Button.module.css";

type ButtonProps = {
  children: JSX.Element;
  onClick?: () => void;
  type?: "submit" | "reset" | "button";
  variant?: "primary" | "secondary" | "shiny";
  size?: "small" | "medium" | "large";
};

export default function Button(props: ButtonProps) {
  const variant = () => props.variant ?? "primary";
  const size = () => props.size ?? "medium";
  const type = () => props.type ?? "button";

  return (
    <button
      classList={{
        [styles.button]: true,
        glimmer: variant() === "shiny",
        "glimmer-hover": variant() === "shiny",
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
