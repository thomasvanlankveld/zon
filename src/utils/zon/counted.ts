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

export function addChildColorValue(parent: Counted, child: Counted) {
  if (parent.numberOfLines === 0) {
    parent.colorValue = child.colorValue;
  } else {
    parent.colorValue +=
      (child.colorValue * child.numberOfLines) / parent.numberOfLines;
  }
}

export function subtractChild(parent: Counted, child: Counted): Counted {
  if (child.numberOfLines === 0) {
    return parent;
  }

  const numberOfLines = parent.numberOfLines - child.numberOfLines;

  const colorValue = (() => {
    if (numberOfLines === 0) {
      return child.colorValue;
    }

    return (
      (parent.colorValue * parent.numberOfLines -
        child.colorValue * child.numberOfLines) /
      numberOfLines
    );
  })();

  return { numberOfLines, colorValue };
}
