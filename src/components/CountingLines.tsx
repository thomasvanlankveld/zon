import { For } from "solid-js";
import { useI18n } from "../contexts/i18n";
import { getPathArray } from "../utils/zon";

type CountingLinesProps = {
  path: string;
};

export default function CountingLines(props: CountingLinesProps) {
  const { t } = useI18n();

  return (
    <span>
      {t("counting-lines.text")}
      <br />
      <For each={getPathArray(props.path)}>
        {(segment) => (
          <>
            <span>{segment}</span>
            /&#8203;
          </>
        )}
      </For>
    </span>
  );
}
