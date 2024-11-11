/**
 * Wrap an async function; Caught errors will be logged to the console.
 * @param func the function to wrap
 * @returns the wrapped function
 */
export default function logAsyncErrors(
  func: () => Promise<unknown>,
): () => void {
  return () => {
    func().catch((error) => console.error(error));
  };
}
