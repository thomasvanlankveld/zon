import { Component } from "solid-js";

type LandingPageProps = {
  isLoading: boolean;
  path?: string;
  countLinesInFolder: () => void;
};

const LandingPage: Component<LandingPageProps> = function LandingPage(props) {
  return (
    <main>
      <h1>Zon</h1>

      <button onClick={() => props.countLinesInFolder()}>Select folder</button>
      {props.isLoading && <p>Counting lines in {props.path}</p>}
    </main>
  );
};

export default LandingPage;
