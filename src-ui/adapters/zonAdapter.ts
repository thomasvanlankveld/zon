import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';

import tokeiAdapter from './tokeiAdapter';
import { Project } from '../project/Project';

/**
 *
 */
const zonJsonType = t.type({
  projectName: t.string,
  languages: t.unknown,
});

/**
 * Lets debuggers know about parse failures
 */
const zonParseErrorMessage = 'Could not parse Zon json';

/**
 *
 */
export default function zonAdapter(input: unknown): Project {
  // Parse Zon JSON
  const parseResult = zonJsonType.decode(input);
  if (isLeft(parseResult)) throw new Error(zonParseErrorMessage);
  const { projectName, languages } = parseResult.right;

  // Pass results to Tokei adapter
  return tokeiAdapter(languages, projectName);
}
