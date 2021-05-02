function delay(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

/**
 * @param {function: Generator<Uint8Array>} generator
 * @param {Promise} closed
 * @returns {ReadableStream}
 */
export function createMockReadableStream(generator, closed) {
  const gen = generator();

  return {
    getReader() {
      return {
        async read() {
          const result = await gen.next();

          await delay(100);

          return result;
        },
        closed
      }
    }
  };
}
