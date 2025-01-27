import { createSignal, For } from "solid-js";
import { rainbow } from "../../utils/zon";

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
  const [base, setBase] = createSignal(0.35);
  const [dynamic, setDynamic] = createSignal(0.5);
  const [offset, setOffset] = createSignal(0.4);

  return (
    <>
      <div style={{ display: "grid", padding: "6rem" }}>
        <div style={{ display: "grid" }}>
          <span>Base: {base()}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={base()}
            onInput={(e) => setBase(Number(e.target.value))}
          />
          <span>Dynamic: {dynamic()}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={dynamic()}
            onInput={(e) => setDynamic(Number(e.target.value))}
          />
          <span>Offset: {offset()}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={offset()}
            onInput={(e) => setOffset(Number(e.target.value))}
          />
        </div>
        <ColorSpread
          getColor={(val) => rainbow(val, base(), dynamic(), offset()).default}
        />
        <ColorSpread
          getColor={(val) =>
            rainbow(val, base(), dynamic(), offset()).highlight
          }
        />
        <ColorSpread
          getColor={(val) =>
            rainbow(val, base(), dynamic(), offset()).dim ?? ""
          }
        />
        {/* <ColorSpread getColor={(val) => rainbow(val, offset()).press} /> */}
      </div>
    </>
  );
}
