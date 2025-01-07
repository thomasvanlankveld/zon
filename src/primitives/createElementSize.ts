// Partially inspired by solid-primitives' createElementSize
// https://github.com/solidjs-community/solid-primitives/blob/f9e669455ecf08b5e6b13d58a5500bea1843a7a8/packages/resize-observer/src/index.ts
import {
  batch,
  createEffect,
  createSignal,
  onCleanup,
  type Accessor,
} from "solid-js";

export type Size = {
  x: Accessor<number>;
  y: Accessor<number>;
  width: Accessor<number>;
  height: Accessor<number>;
};

/**
 * Get signals that represent a given element's size
 * @param target Element accessor
 * @param defaults Default width and height
 * @returns Accessors for the observed element's width and height
 * @example
 * const [svg, setSvg] = createSignal<SVGSVGElement>();
 * const { width, height } = createElementSize(svg);
 * return <svg ref={setSvg} style={{ flex: "1 1 0%" }} />;
 */
export default function createElementSize(
  target: Accessor<Element | false | undefined | null>,
): Readonly<Size> {
  const [x, setX] = createSignal<number>();
  const [y, setY] = createSignal<number>();
  const [width, setWidth] = createSignal<number>();
  const [height, setHeight] = createSignal<number>();

  function setSize(size: DOMRectReadOnly) {
    batch(() => {
      setX(size.x);
      setY(size.y);
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

  return {
    x: x as Accessor<number>,
    y: y as Accessor<number>,
    width: width as Accessor<number>,
    height: height as Accessor<number>,
  };
}
