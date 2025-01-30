import { Counted } from "./types";

export function createCounted(numberOfLines: number): Counted {
  return { numberOfLines, colorValue: 0 };
}

export function sumCounted(countedVals: Counted[]): Counted {
  const numberOfLines = countedVals.reduce(
    (sum, counted) => sum + counted.numberOfLines,
    0,
  );

  const colorValue = (() => {
    if (numberOfLines === 0) {
      // Regular average, because the weighted average would result in 0 / 0 which is `NaN`
      return (
        countedVals.reduce((sum, counted) => sum + counted.colorValue, 0) /
        countedVals.length
      );
    }

    // Weighted average
    return (
      countedVals.reduce(
        (sum, counted) => sum + counted.colorValue * counted.numberOfLines,
        0,
      ) / numberOfLines
    );
  })();

  return { numberOfLines, colorValue };
}

/**
 * This function modifies the parent's `colorValue`. Before calling this function, the parent's number of lines should
 * already be total of all its children's lines.
 */
export function addChildColorValue(parent: Counted, child: Counted): void {
  if (parent.numberOfLines === 0) {
    parent.colorValue = child.colorValue;
  } else {
    parent.colorValue +=
      (child.colorValue * child.numberOfLines) / parent.numberOfLines;
  }
}

/**
 * Resulting number of lines and color value after removing a child from its parent
 * @param fallbackColorValue Used when the resulting number of lines is 0. Default is the parent's color value.
 */
export function subtractChild(
  parent: Counted,
  child: Counted,
  fallbackColorValue?: number,
): Counted {
  if (child.numberOfLines === 0) {
    return parent;
  }

  const numberOfLines = parent.numberOfLines - child.numberOfLines;

  const colorValue = (() => {
    if (numberOfLines === 0) {
      return fallbackColorValue ?? parent.colorValue;
    }

    return (
      (parent.colorValue * parent.numberOfLines -
        child.colorValue * child.numberOfLines) /
      numberOfLines
    );
  })();

  return { numberOfLines, colorValue };
}
