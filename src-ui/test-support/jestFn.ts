// eslint-disable-next-line @typescript-eslint/no-explicit-any
type func = (...args: any) => any;

/**
 * Type of a helper to make mock code more concise.
 */
export type JestFn<T extends func> = jest.Mock<ReturnType<T>, Parameters<T>>;

/**
 * Helper to make mock code more concise.
 */
export default function jestFn<T extends func>(): JestFn<T> {
  return jest.fn<ReturnType<T>, Parameters<T>>();
}
