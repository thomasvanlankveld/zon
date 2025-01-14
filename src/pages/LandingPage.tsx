import { For, Show } from "solid-js";
import UploadButton from "../components/UploadButton/UploadButton";
import CountingLines from "../components/CountingLines";
import { useI18n } from "../utils/i18n";
import { rainbow } from "../utils/zon/color";

type LandingPageProps = {
  isLoading: boolean;
  path?: string;
  countLinesInFolder: () => void;
};

function ColorSpread(props: { getColor: (val: number) => string }) {
  const colors = () =>
    Array.from({ length: 1001 })
      .fill(null)
      .map((_, index) => props.getColor(Number((0.001 * index).toFixed(3))));

  return (
    <svg width="1000" height="100">
      <For each={colors()}>
        {(color, index) => (
          <rect x={index()} y={0} width={1} height={100} fill={color} />
        )}
      </For>
    </svg>
  );
}

function ColorTest() {
  return (
    <div style={{ display: "grid", padding: "6rem" }}>
      <ColorSpread getColor={(val) => rainbow(val).default} />
      <ColorSpread getColor={(val) => rainbow(val).highlighted} />
      <ColorSpread getColor={(val) => rainbow(val).pressed} />
    </div>
  );
}

export default function LandingPage(props: LandingPageProps) {
  const { t } = useI18n();

  return (
    <main>
      <h1>{t("app.title")}</h1>

      <ColorTest />
      <UploadButton countLinesInFolder={props.countLinesInFolder} />
      <Show when={props.isLoading}>
        <CountingLines path={props.path as string} />
      </Show>
    </main>
  );
}
