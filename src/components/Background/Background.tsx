import {
  batch,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  JSX,
  useContext,
} from "solid-js";
import { conicGradient } from "../../utils/zon";

const DEFAULT_START_POSITION = 0;
const DEFAULT_SPAN = 1;
const DEFAULT_OPACITY = 0.1;

type BackgroundOptions = {
  startPosition?: number;
  span?: number;
  opacity?: number;
};

function createBackgroundState() {
  const [startPosition, setStartPosition] = createSignal(
    DEFAULT_START_POSITION,
  );
  const [span, setSpan] = createSignal(DEFAULT_SPAN);
  const [opacity, setOpacity] = createSignal(DEFAULT_OPACITY);

  function updateBackground(options: BackgroundOptions = {}) {
    batch(() => {
      if (options.opacity !== undefined) setOpacity(options.opacity);
      if (options.startPosition !== undefined)
        setStartPosition(options.startPosition);
      if (options.span !== undefined) setSpan(options.span);
    });
  }

  const gradient = createMemo(() =>
    conicGradient({ startPosition: startPosition(), span: span() }),
  );

  return { gradient, opacity, updateBackground };
}

const BackgroundContext = createContext();

type BackgroundProps = {
  children: JSX.Element;
};

/**
 * The actual background
 */
export function Background(props: BackgroundProps) {
  const backgroundState = createBackgroundState();

  return (
    <div
      style={{
        "--cloudy-background": backgroundState.gradient(),
        "--cloudy-opacity": backgroundState.opacity(),
      }}
      class="cloudy"
    >
      <BackgroundContext.Provider value={backgroundState}>
        {props.children}
      </BackgroundContext.Provider>
    </div>
  );
}

type BackgroundState = ReturnType<typeof createBackgroundState>;

function useBackgroundState(): BackgroundState {
  return useContext(BackgroundContext) as BackgroundState;
}

type BackgroundConfigProps = BackgroundOptions;

/**
 * Render this component anywhere in the `Background` component's child tree to configure it
 */
export function BackgroundConfig(props: BackgroundConfigProps) {
  const backgroundState = useBackgroundState();

  createEffect(() => {
    backgroundState.updateBackground({
      startPosition: props.startPosition ?? DEFAULT_START_POSITION,
      span: props.span ?? DEFAULT_SPAN,
      opacity: props.opacity ?? DEFAULT_OPACITY,
    });
  });

  return <></>;
}
