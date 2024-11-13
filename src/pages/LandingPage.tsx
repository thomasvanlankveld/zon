type LandingPageProps = {
  isLoading: boolean;
  path?: string;
  countLinesInFolder: () => void;
};

export default function LandingPage(props: LandingPageProps) {
  return (
    <main>
      <h1>Zon</h1>

      <button onClick={() => props.countLinesInFolder()}>Select folder</button>
      {props.isLoading && <p>Counting lines in {props.path}</p>}
    </main>
  );
}
