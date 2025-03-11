import { JSX } from "solid-js";
import styles from "./ShinyButton.module.css";

type ShinyButtonProps = {
  onClick?: () => void;
  type?: "submit" | "reset" | "button";
  children: JSX.Element;
};

export default function ShinyButton(props: ShinyButtonProps) {
  return (
    <button
      class={`${styles["shiny-button"]} glimmer glimmer-hover glow`}
      type={props.type ?? "button"}
      onClick={() => props.onClick?.()}
    >
      {props.children}
    </button>
  );
}
