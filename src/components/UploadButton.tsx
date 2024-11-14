type UploadButtonProps = {
  countLinesInFolder: () => void;
};

export default function UploadButton(props: UploadButtonProps) {
  return (
    <button onClick={() => props.countLinesInFolder()}>Select folder</button>
  );
}
