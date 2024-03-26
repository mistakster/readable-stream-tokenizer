import { FinishedStreamError } from './FinishedStreamError.mjs';

export class Tokenizer {
  /**
   * @param {ReadableStream} stream
   */
  constructor(stream) {
    this._reader = stream.getReader();
    this._closed = this._reader.closed.then(() => true);
    /**
     * @type {Uint8Array[]}
     * @private
     */
    this._buffer = [];
    this._bufferLength = 0;
    this._chunkOffset = 0;
  }

  /**
   * @returns {Promise<boolean>}
   * @private
   */
  async _readNextChunk() {
    const { done, value } = await this._reader.read();
    if (!done) {
      this._buffer.push(value);
      this._bufferLength += value.length;
    }
    return done;
  }

  /**
   * @param {number} length
   * @returns {Promise<void>}
   * @private
   */
  async _readNextBytes(length) {
    while (this._bufferLength < length) {
      const done = await Promise.race([
        this._closed,
        this._readNextChunk()
      ]);
      if (done && this._bufferLength < length) {
        throw new FinishedStreamError('ReadableStream has been finished');
      }
    }
  }


  /**
   * Concatenate buffers in the buffer array up to a given length.
   * @param {number} length - The total length to concatenate.
   * @returns {Uint8Array} - Concatenated buffer.
   * @private
   */
  _concatBuffers(length) {
    const result = new Uint8Array(length);
    let offset = 0;
    let remainingLength = length;
    while (remainingLength > 0) {
      const chunk = this._buffer[0];
      const bytesToCopy = Math.min(chunk.byteLength - this._chunkOffset, remainingLength);
      result.set(chunk.subarray(this._chunkOffset, this._chunkOffset + bytesToCopy), offset);
      offset += bytesToCopy;
      remainingLength -= bytesToCopy;
      if (bytesToCopy === chunk.byteLength - this._chunkOffset) {
        this._buffer.shift();
        this._chunkOffset = 0;
      } else {
        this._chunkOffset += bytesToCopy;
      }
    }
    this._bufferLength -= length;
    return result;
  }

  /**
   * @returns {Promise<number>}
   */
  async readUint32() {
    const value = await this.readUint8Array(4);
    return new DataView(value.buffer).getUint32(value.byteOffset);
  }

  /**
   * @param {number} length
   * @returns {Promise<Uint8Array>}
   */
  async readUint8Array(length) {
    await this._readNextBytes(length);
    return this._concatBuffers(length);
  }
}
