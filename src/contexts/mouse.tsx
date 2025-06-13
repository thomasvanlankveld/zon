import {
  createContext,
  createSignal,
  onCleanup,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";

type MousePosition = { x: number; y: number };

type MouseContextType = {
  position: Accessor<MousePosition>;
};

const MouseContext = createContext<MouseContextType>();

/**
 * Provider component that tracks mouse position globally
 *
 * The main reason this exists as a context, is so that we can access the mouse position from a component as it is
 * rendered for the first time. Other methods generally run into a race condition, where they need the mouse position
 * before we get a value from the `mousemove` event listener.
 *
 * @param props.children Child components that will have access to mouse position
 */
export function MouseProvider(props: { children: JSX.Element }) {
  const [position, setPosition] = createSignal<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  // Add global mouse move listener
  window.addEventListener("mousemove", handleMouseMove);

  // Clean up the event listener when the provider is disposed
  onCleanup(() => {
    window.removeEventListener("mousemove", handleMouseMove);
  });

  return (
    <MouseContext.Provider value={{ position }}>
      {props.children}
    </MouseContext.Provider>
  );
}

/**
 * Hook to access the global mouse position
 * @returns An accessor that returns the current mouse position {x, y}
 * @example
 * const mousePosition = useMouse();
 * createEffect(() => {
 *   console.log(`Mouse is at ${mousePosition().x}, ${mousePosition().y}`);
 * });
 */
export function useMouse(): Accessor<MousePosition> {
  const context = useContext(MouseContext);
  if (!context) {
    throw new Error("useMouse must be used within a MouseProvider");
  }
  return context.position;
}
