import { For } from "solid-js";
import { rainbow } from "../../utils/zon/color";

function ColorSpread(props: { getColor: (val: number) => string }) {
  const colors = () =>
    Array.from({ length: 1001 })
      .fill(null)
      .map((_, index) => props.getColor(Number((0.001 * index).toFixed(3))));

  return (
    <svg width="1000" height="100">
      <For each={colors()}>
        {(color, index) => (
          <rect x={index()} y={0} width={1} height={100} fill={color} />
        )}
      </For>
    </svg>
  );
}

export default function ColorTest() {
  return (
    <div style={{ display: "grid", padding: "6rem" }}>
      <ColorSpread getColor={(val) => rainbow(val).default} />
      <ColorSpread getColor={(val) => rainbow(val).highlight} />
      <ColorSpread getColor={(val) => rainbow(val).press} />
    </div>
  );
}
