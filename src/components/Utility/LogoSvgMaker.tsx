import { createSignal } from "solid-js";
import Logo from "../Logo";

//
export default function LogoSvgMaker() {
  const [svg, setSvg] = createSignal<SVGSVGElement | undefined>();
  const size = 1024;

  // In Apple's Design resources, the "icon grid bounding box" is 412px for an image size of 512px
  // https://developer.apple.com/design/resources/
  // https://developer.apple.com/design/human-interface-guidelines/app-icons/#macOS
  // https://developer.apple.com/design/human-interface-guidelines/app-icons/#macOS-app-icon-sizes
  // OUTDATED: Instead we made these in Sketch, using a 1028 size export at factor 1 as source rainbow
  // const circleSizeRatio = 412 / 512;

  // Elsewhere, we keep some space to the edge, same as the Tauri logo has on top and bottom
  // const circleSizeRatio = 423 / 512;

  // To use the rainbow disk as an element in a design, full size is best
  const circleSizeRatio = 1;

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
      <Logo size={size} setSvg={setSvg} circleSizeRatio={circleSizeRatio} />
      <button onClick={onSaveClick}>Console log SVG</button>
    </div>
  );
}
