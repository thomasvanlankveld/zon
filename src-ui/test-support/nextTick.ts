/**
 * Use to flush promises and other things in tests.
 *
 * Source: https://github.com/facebook/jest/issues/2157#issuecomment-366202533
 */
export default function nextTick(): Promise<undefined> {
  return new Promise((resolve) => process.nextTick(resolve));
}
