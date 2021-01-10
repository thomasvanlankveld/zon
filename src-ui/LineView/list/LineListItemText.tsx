import React, { FC } from 'react';
import formatNumber from '../../component-lib/format/formatNumber';
import { LineViewNode } from '../LineViewNode';

interface LineListItemTextProps {
  node: LineViewNode;
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

  const { filename } = node.data;

  const numberOfLinesText = `${formatNumber(node.value || 0)} lines`;

  const numberOfBlanks = charsPerListItem - (filename.length + numberOfLinesText.length);

  const filenameText = ((): string => {
    if (numberOfBlanks >= 1) return filename;

    const numberOfFilenameChars =
      charsPerListItem - (numberOfLinesText.length + minimumSpace) - truncation.length;
    return `${filename.substring(0, numberOfFilenameChars)}${truncation}`;
  })();

  const blanksText = Array.from({ length: Math.max(numberOfBlanks, minimumSpace) }, () => ' ').join(
    ''
  );

  return <>{`${filenameText}${blanksText}${numberOfLinesText}`}</>;
};

export default LineListItemText;
