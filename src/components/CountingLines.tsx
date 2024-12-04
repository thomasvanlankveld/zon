type CountingLinesProps = {
  path: string;
};

export default function CountingLines(props: CountingLinesProps) {
  return <p>Counting lines in {props.path}</p>;
}
