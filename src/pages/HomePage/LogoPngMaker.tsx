import { createSignal } from "solid-js";
import LogoEfficient from "../../components/LogoEfficient";

//
export default function LogoPngMaker() {
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
  const [svg, setSvg] = createSignal<SVGSVGElement | undefined>();
  const [size, setSize] = createSignal(50);

  // In Apple's Design resources, the "icon grid bounding box" is 412px for an image size of 512px
  // https://developer.apple.com/design/resources/
  // https://developer.apple.com/design/human-interface-guidelines/app-icons/#macOS
  // https://developer.apple.com/design/human-interface-guidelines/app-icons/#macOS-app-icon-sizes
  // OUTDATED: Instead we made these in Sketch, using a 1028 size export at factor 1 as source rainbow
  // const factor = 412 / 512;

  // Elsewhere, we keep some space to the edge, same as the Tauri logo has on top and bottom
  const factor = 423 / 512;

  // To use the rainbow disk as an element in a design, full size is best
  // const factor = 1;

  function onSaveClick() {
    const svgEl = svg();

    if (svgEl == null) {
      throw new Error("No SVG");
    }

    const svgString = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      const canvasEl = canvas();

      if (canvasEl == null) {
        throw new Error("No canvas");
      }

      const ctx = canvasEl.getContext("2d");
      canvasEl.width = img.width;
      canvasEl.height = img.height;

      if (ctx == null) {
        throw new Error("No context");
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Convert canvas to PNG and download
      const pngUrl = canvasEl.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `Square${size()}x${size()}Logo.png`;
      link.click();
    };
  }

  return (
    <div style={{ display: "grid" }}>
      <input
        type="number"
        step="1"
        value={size()}
        onInput={(e) => setSize(Number(e.target.value))}
      />
      <canvas ref={setCanvas} hidden />
      <LogoEfficient size={size()} setSvg={setSvg} factor={factor} />
      <button onClick={onSaveClick}>Save PNG</button>
    </div>
  );
}
