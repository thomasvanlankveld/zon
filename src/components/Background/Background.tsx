import {
  batch,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  JSX,
  useContext,
} from "solid-js";
import { colorRange } from "../../utils/zon";
import styles from "./Background.module.css";

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

  const colors = createMemo(() =>
    colorRange({
      numberOfColors: 20,
      startPosition: startPosition(),
      span: span(),
    }),
  );

  return { colors, opacity, updateBackground };
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
        "--background-color-0": backgroundState.colors()[0],
        "--background-color-1": backgroundState.colors()[1],
        "--background-color-2": backgroundState.colors()[2],
        "--background-color-3": backgroundState.colors()[3],
        "--background-color-4": backgroundState.colors()[4],
        "--background-color-5": backgroundState.colors()[5],
        "--background-color-6": backgroundState.colors()[6],
        "--background-color-7": backgroundState.colors()[7],
        "--background-color-8": backgroundState.colors()[8],
        "--background-color-9": backgroundState.colors()[9],
        "--background-color-10": backgroundState.colors()[10],
        "--background-color-11": backgroundState.colors()[11],
        "--background-color-12": backgroundState.colors()[12],
        "--background-color-13": backgroundState.colors()[13],
        "--background-color-14": backgroundState.colors()[14],
        "--background-color-15": backgroundState.colors()[15],
        "--background-color-16": backgroundState.colors()[16],
        "--background-color-17": backgroundState.colors()[17],
        "--background-color-18": backgroundState.colors()[18],
        "--background-color-19": backgroundState.colors()[19],
        "--background-opacity": backgroundState.opacity(),
      }}
      class={styles["background"]}
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
