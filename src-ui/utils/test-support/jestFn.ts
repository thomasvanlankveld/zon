/**
 * Helper to make mock code more concise.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function jestFn<T extends (...args: any) => any>(): jest.Mock<
  ReturnType<T>,
  Parameters<T>
> {
  return jest.fn<ReturnType<T>, Parameters<T>>();
}
