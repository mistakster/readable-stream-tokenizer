function delay(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

/**
 * @param {function: Generator<Uint8Array>} generator
 * @returns {ReadableStream}
 */
export function createMockReadableStream(generator) {
  async function* delayedGenerator() {
    for (const value of generator()) {
      yield value;

      await delay(100);
    }
  }

  return ReadableStream.from(delayedGenerator());
}
