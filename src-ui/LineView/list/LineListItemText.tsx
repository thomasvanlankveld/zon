import React, { FC } from 'react';
import formatNumber from '../../component-lib/format/formatNumber';
import { Project } from '../../project/Project';

interface LineListItemTextProps {
  node: Project;
}

const charsPerListItem = 40;
const minimumSpace = 1;
const truncation = '...';

/**
 * Text for the line list items
 *
 * Contains the file name, the number of lines, and a number of spaces in between so the linecounts line up
 *
 * To preserve the whitespaces, the parent should use style `white-space: pre;`
 */
const LineListItemText: FC<LineListItemTextProps> = function listItemText(props) {
  const { node } = props;

  const { nodeName } = node;

  const numberOfLinesText = `${formatNumber(node.data.numberOfLines)} lines`;

  const numberOfBlanks = charsPerListItem - (nodeName.length + numberOfLinesText.length);

  const filenameText = ((): string => {
    if (numberOfBlanks >= 1) return nodeName;

    const numberOfFilenameChars =
      charsPerListItem - (numberOfLinesText.length + minimumSpace) - truncation.length;
    return `${nodeName.substring(0, numberOfFilenameChars)}${truncation}`;
  })();

  const blanksText = Array.from({ length: Math.max(numberOfBlanks, minimumSpace) }, () => ' ').join(
    ''
  );

  return <>{`${filenameText}${blanksText}${numberOfLinesText}`}</>;
};

export default LineListItemText;
