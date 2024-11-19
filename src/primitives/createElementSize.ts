import {
  batch,
  createEffect,
  createSignal,
  onCleanup,
  type Accessor,
} from "solid-js";

export type Size = { width: Accessor<number>; height: Accessor<number> };
export type StaticSize = { width: number; height: number };

/**
 * Get signals that represent a given element's size
 * @param target Element accessor
 * @param defaults Default width and height
 * @returns Accessors for the observed element's width and height
 * @example
 * const [svg, setSvg] = createSignal<SVGSVGElement>();
 * const { width, height } = createElementSize(svg, { width: 500, height: 500 });
 * return <svg ref={setSvg} style={{ flex: "1 1 0%" }} />;
 */
export default function createElementSize(
  target: Accessor<Element | false | undefined | null>,
  defaults: StaticSize,
): Readonly<Size> {
  const [width, setWidth] = createSignal(defaults.width);
  const [height, setHeight] = createSignal(defaults.height);

  function setSize(size: StaticSize) {
    batch(() => {
      setWidth(size.width);
      setHeight(size.height);
    });
  }

  const resizeObserver = new ResizeObserver(([entry]) =>
    setSize(entry.contentRect),
  );

  createEffect(() => {
    const element = target();

    if (element) {
      setSize(element.getBoundingClientRect());
      resizeObserver.observe(element);
      onCleanup(() => resizeObserver.unobserve(element));
    }
  });

  onCleanup(() => {
    resizeObserver.disconnect();
  });

  return { width, height };
}
