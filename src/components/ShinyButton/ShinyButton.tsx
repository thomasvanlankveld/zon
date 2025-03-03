import { JSX } from "solid-js";
import styles from "./ShinyButton.module.css";

type ShinyButtonProps = {
  onClick?: () => void;
  type?: "submit";
  children: JSX.Element;
};

export default function ShinyButton(props: ShinyButtonProps) {
  return (
    <button
      style={{ "--glimmer-border-radius": "8px" }}
      class={`${styles["shiny-button"]} glimmer glimmer-hover glow`}
      type={props.type}
      onClick={() => props.onClick?.()}
    >
      {props.children}
    </button>
  );
}
