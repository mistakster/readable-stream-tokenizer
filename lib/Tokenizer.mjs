import { FinishedStreamError } from './FinishedStreamError.mjs';

export class Tokenizer {
  /**
   * @param {ReadableStream} stream
   */
  constructor(stream) {
    this._reader = stream.getReader();
    this._closed = this._reader.closed.then(() => true);
    this._data = new Uint8Array(0);
  }

  /**
   * @param {Uint8Array} chunk
   * @private
   */
  _appendChunk(chunk) {
    const tmp = new Uint8Array(this._data.byteLength + chunk.byteLength);

    tmp.set(new Uint8Array(this._data), 0);
    tmp.set(new Uint8Array(chunk), this._data.byteLength);

    this._data = tmp;
  }

  async _readNextChunk() {
    const { done, value } = await this._reader.read();

    if (!done) {
      this._appendChunk(value);
    }

    return done;
  }

  async _readNextBytes(length) {
    while (this._data.byteLength < length) {
      const done = await Promise.race([
        this._closed,
        this._readNextChunk()
      ]);

      if (done && this._data.byteLength < length) {
        throw new FinishedStreamError('ReadableStream has been finished');
      }
    }
  }

  /**
   * @returns {Promise<Number>}
   */
  async readUint32() {
    await this._readNextBytes(4);

    const value = new DataView(this._data.buffer).getUint32(0);

    this._data = this._data.slice(4);

    return value;
  }

  /**
   * @param {Number} length
   * @returns {Promise<Uint8Array>}
   */
  async readUint8Array(length) {
    await this._readNextBytes(length);

    const value = new Uint8Array(length);

    value.set(this._data.slice(0, length), 0);

    this._data = this._data.slice(length);

    return value;
  }
}
