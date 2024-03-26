function delay(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

/**
 * @param {function: Generator<Uint8Array>} generator
 * @returns {Generator<Uint8Array>}
 */
async function* delayedGenerator(generator) {
  for (const value of generator()) {
    yield value;

    await delay(100);
  }
}

/**
 * @param {function: Generator<Uint8Array>} generator
 * @returns {ReadableStream}
 */
export function createMockReadableStream(generator) {
  return ReadableStream.from(delayedGenerator(generator));
}
