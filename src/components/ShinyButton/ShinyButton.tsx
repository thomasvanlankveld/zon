import { JSX } from "solid-js";
import styles from "./ShinyButton.module.css";

type ShinyButtonProps = {
  onClick: () => void;
  children: JSX.Element;
};

export default function ShinyButton(props: ShinyButtonProps) {
  return (
    <button
      style={{ "--glimmer-border-radius": "8px" }}
      class={`${styles["shiny-button"]} glimmer glimmer-hover glow`}
      onClick={() => props.onClick()}
    >
      {props.children}
    </button>
  );
}
