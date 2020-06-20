import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { flatMap } from 'lodash';

import { Project } from '../project/Project';
import { toPathArray, toPathString, createTree } from '../utility/file-tree';

/**
 * Allows us to parse Tokei languages
 *
 * No need to be too strict about this, any string will do
 */
const tokeiLanguageType = t.string;

/**
 * Allows us to parse Tokei stats
 *
 * Tokei stats have all sorts of goodies
 */
const tokeiStatsType = t.type({
  blanks: t.number,
  code: t.number,
  comments: t.number,
  lines: t.number,
});

/**
 * Allows us to parse Tokei JSON output
 *
 * This is list of stats per language, including totals for the language and stats per file
 */
const tokeiJsonType = t.type({
  inner: t.record(
    tokeiLanguageType,
    t.intersection([
      tokeiStatsType,
      t.type({
        inaccurate: t.boolean,
        stats: t.array(t.intersection([tokeiStatsType, t.type({ name: t.string })])),
      }),
    ])
  ),
});

/**
 * Lets debuggers know about parse failures
 */
const tokeiParseErrorMessage = 'Could not parse Tokei json';

/**
 * Parse Tokei JSON ouput as a Zon project
 */
export default function tokeiAdapter(input: unknown, projectName: string): Project {
  // Parse Tokei JSON
  const parseResult = tokeiJsonType.decode(input);
  if (isLeft(parseResult)) throw new Error(tokeiParseErrorMessage);
  const parsed = parseResult.right;

  // Extract an array of files, each with path and number of lines of code
  const languages = Object.values(parsed.inner);
  const files = flatMap(languages, (language) => language.stats).map((file) => {
    // Drop any "current folder" specifiers in the file paths and prepend the project name
    const path = toPathArray(file.name);
    if (path[0] === '.') path.splice(0, 1);
    const pathString = toPathString([projectName].concat(path));

    // Extract number of lines of code
    const { code } = file;

    // Return file specs
    return { numberOfLines: code, path: pathString };
  });

  // Construct the file tree
  return createTree(projectName, files);
}
