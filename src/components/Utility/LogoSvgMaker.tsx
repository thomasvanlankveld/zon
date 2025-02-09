// Not a neat script, just a quick way to get the logo as an svg

import { createSignal } from "solid-js";
import Logo from "../Logo";

export default function LogoSvgMaker() {
  const [svg, setSvg] = createSignal<SVGSVGElement | undefined>();
  const size = 1024;

  // This ratio keeps some space to the edge, same as the Tauri logo has on top and bottom
  // const circleSizeRatio = 423 / 512;

  // To use the rainbow disk as an element in a design, full size is best
  const circleSizeRatio = 1;

  function onSaveClick() {
    const svgEl = svg();

    if (svgEl == null) {
      throw new Error("No SVG");
    }

    const svgString = new XMLSerializer().serializeToString(svgEl);

    // You can copy-paste the console output into an svg file
    console.log(svgString);
  }

  return (
    <div style={{ display: "grid" }}>
      <Logo size={size} setSvg={setSvg} circleSizeRatio={circleSizeRatio} />
      <button onClick={onSaveClick}>Console log SVG</button>
    </div>
  );
}
