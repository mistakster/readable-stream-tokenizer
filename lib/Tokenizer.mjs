import { FinishedStreamError } from './FinishedStreamError.mjs';

export class Tokenizer {
  /**
   * @param {ReadableStream} stream
   */
  constructor(stream) {
    this._reader = stream.getReader();
    this._closed = this._reader.closed.then(() => true);
    this._data = new Uint8Array(0);
    this._offset = 0;
  }

  /**
   * @param {Uint8Array} chunk
   * @private
   */
  _appendChunk(chunk) {
    const offset = this._offset;
    const length = this._data.byteLength - offset;
    const tmp = new Uint8Array(length + chunk.byteLength);

    if (length > 0) {
      tmp.set(this._data.subarray(offset), 0);
    }
    tmp.set(chunk, length);

    this._data = tmp;
    this._offset = 0;
  }

  /**
   * @returns {Promise<boolean>}
   * @private
   */
  async _readNextChunk() {
    const { done, value } = await this._reader.read();

    if (!done) {
      this._appendChunk(value);
    }

    return done;
  }

  /**
   * @param length
   * @returns {Promise<void>}
   * @private
   */
  async _readNextBytes(length) {
    while (this._data.byteLength - this._offset < length) {
      const done = await Promise.race([
        this._closed,
        this._readNextChunk()
      ]);

      if (done && this._data.byteLength - this._offset < length) {
        throw new FinishedStreamError('ReadableStream has been finished');
      }
    }
  }

  /**
   * @returns {Promise<Number>}
   */
  async readUint32() {
    const value = await this.readUint8Array(4);
    return new DataView(value.buffer).getUint32(value.byteOffset);
  }

  /**
   * @param {Number} length
   * @returns {Promise<Uint8Array>}
   */
  async readUint8Array(length) {
    await this._readNextBytes(length);
    const value = this._data.subarray(this._offset, this._offset + length);
    this._offset += length;
    return value;
  }
}
