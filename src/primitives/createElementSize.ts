// Partially inspired by solid-primitives' createElementSize
// https://github.com/solidjs-community/solid-primitives/blob/f9e669455ecf08b5e6b13d58a5500bea1843a7a8/packages/resize-observer/src/index.ts
import {
  batch,
  createEffect,
  createSignal,
  onCleanup,
  type Accessor,
} from "solid-js";
import { ValueOf } from "../utils/type";

export type Size = { width: Accessor<number>; height: Accessor<number> };
export type StaticSize = { width: number; height: number };

const STRATEGY = {
  UNKNOWN: "unknown",
  RESIZE_OBSERVER: "resizeObserver",
  BOUNDING_CLIENT_RECT: "boundingClientRect",
} as const;
type STRATEGY = ValueOf<typeof STRATEGY>;

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
  const [strategy, setStrategy] = createSignal<STRATEGY>(STRATEGY.UNKNOWN);
  const [width, setWidth] = createSignal<number>();
  const [height, setHeight] = createSignal<number>();

  function setSize(size: StaticSize) {
    batch(() => {
      setWidth(size.width);
      setHeight(size.height);
    });
  }

  /**
   * On first read, this will determine the strategy to use for reading the size of the element. Some browsers will give
   * incorrect width and height values in the ResizeObserverEntry (Safari 13.1). In those cases, we use
   * getBoundingClientRect(). This always gives the correct size, but is not as efficient as the ResizeObserverEntry's
   * direct values, which is why we still use those if they give the correct size.
   * @param entry Resize observer entry
   * @returns Size
   */
  function readSize(entry: ResizeObserverEntry) {
    if (strategy() === STRATEGY.UNKNOWN) {
      const rect = entry.target.getBoundingClientRect();

      if (
        rect.height === entry.borderBoxSize[0].blockSize ||
        rect.width === entry.borderBoxSize[0].inlineSize
      ) {
        setStrategy(STRATEGY.RESIZE_OBSERVER);
      } else {
        setStrategy(STRATEGY.BOUNDING_CLIENT_RECT);
      }

      return { width: rect.width, height: rect.height };
    }

    if (strategy() === STRATEGY.RESIZE_OBSERVER) {
      return {
        width: entry.borderBoxSize[0].inlineSize,
        height: entry.borderBoxSize[0].blockSize,
      };
    }

    const rect = entry.target.getBoundingClientRect();

    return { width: rect.width, height: rect.height };
  }

  const resizeObserver = new ResizeObserver(([entry]) =>
    setSize(readSize(entry)),
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
    width: width as Accessor<number>,
    height: height as Accessor<number>,
  };
}
