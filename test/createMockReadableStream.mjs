/**
 * @param {function: Generator<Uint8Array>} generator
 * @returns {ReadableStream}
 */
export function createMockReadableStream(generator) {
  const gen = generator();

  return {
    getReader() {
      return {
        async read() {
          return gen.next();
        }
      }
    }
  };
}
