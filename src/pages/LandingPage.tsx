import { Show } from "solid-js";
import UploadButton from "../components/UploadButton";
import CountingLines from "../components/CountingLines";

type LandingPageProps = {
  isLoading: boolean;
  path?: string;
  countLinesInFolder: () => void;
};

export default function LandingPage(props: LandingPageProps) {
  return (
    <main>
      <h1>Zon</h1>

      <UploadButton countLinesInFolder={props.countLinesInFolder} />
      <Show when={props.isLoading}>
        <CountingLines path={props.path as string} />
      </Show>
    </main>
  );
}
