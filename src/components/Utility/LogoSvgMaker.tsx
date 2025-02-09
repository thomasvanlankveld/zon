import { createSignal } from "solid-js";
import Logo from "../Logo";

//
export default function LogoSvgMaker() {
  const [svg, setSvg] = createSignal<SVGSVGElement | undefined>();
  const [numberOfColors, setNumberOfColors] = createSignal(20);
  const size = 1024;

  // In Apple's Design resources, the "icon grid bounding box" is 412px for an image size of 512px
  // https://developer.apple.com/design/resources/
  // https://developer.apple.com/design/human-interface-guidelines/app-icons/#macOS
  // https://developer.apple.com/design/human-interface-guidelines/app-icons/#macOS-app-icon-sizes
  // OUTDATED: Instead we made these in Sketch, using a 1028 size export at factor 1 as source rainbow
  // const factor = 412 / 512;

  // Elsewhere, we keep some space to the edge, same as the Tauri logo has on top and bottom
  // const factor = 423 / 512;

  // To use the rainbow disk as an element in a design, full size is best
  const factor = 1;

  function onSaveClick() {
    const svgEl = svg();

    if (svgEl == null) {
      throw new Error("No SVG");
    }

    const svgString = new XMLSerializer().serializeToString(svgEl);
    console.log(svgString);
  }

  return (
    <div style={{ display: "grid" }}>
      <input
        type="number"
        step="1"
        value={numberOfColors()}
        onInput={(e) => setNumberOfColors(Number(e.target.value))}
      />
      <Logo
        size={size}
        numberOfColors={numberOfColors()}
        setSvg={setSvg}
        factor={factor}
      />
      <button onClick={onSaveClick}>Console log SVG</button>
    </div>
  );
}
