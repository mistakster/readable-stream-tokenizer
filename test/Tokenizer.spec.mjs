import { describe, it, expect } from "vitest";
import { Tokenizer, FinishedStreamError } from '../lib/index.mjs';
import { createMockReadableStream } from './utils/createMockReadableStream.mjs';

describe('Tokenizer', () => {
  it('should read the Uint32 from the equal chunks', async () => {
    function* generator() {
      yield new Uint8Array([0, 8, 16, 24]);
      yield new Uint8Array([32, 40, 48, 56]);
      yield new Uint8Array([1, 2, 3, 4]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator));

    expect(await tokenizer.readUint32()).toEqual(528408);
    expect(await tokenizer.readUint32()).toEqual(539504696);
    expect(await tokenizer.readUint32()).toEqual(16909060);
  });

  it('should read the Uint32 from the smaller chunks', async () => {
    function* generator() {
      yield new Uint8Array([0]);
      yield new Uint8Array([8]);
      yield new Uint8Array([16]);
      yield new Uint8Array([24, 32, 40]);
      yield new Uint8Array([48]);
      yield new Uint8Array([56]);
      yield new Uint8Array([1]);
      yield new Uint8Array([2, 3, 4]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator));

    expect(await tokenizer.readUint32()).toEqual(528408);
    expect(await tokenizer.readUint32()).toEqual(539504696);
    expect(await tokenizer.readUint32()).toEqual(16909060);
  });

  it('should read the Uint32 from the larger chunks', async () => {
    function* generator() {
      yield new Uint8Array([0, 8, 16, 24, 32, 40, 48, 56, 1, 2, 3, 4]);
      yield new Uint8Array([0, 8, 16, 24, 32, 40, 48, 56, 1, 2, 3, 4]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator));

    expect(await tokenizer.readUint32()).toEqual(528408);
    expect(await tokenizer.readUint32()).toEqual(539504696);
    expect(await tokenizer.readUint32()).toEqual(16909060);
    expect(await tokenizer.readUint32()).toEqual(528408);
    expect(await tokenizer.readUint32()).toEqual(539504696);
    expect(await tokenizer.readUint32()).toEqual(16909060);
  });

  it('should read Uint8Array from the equal chunks', async () => {
    function* generator() {
      yield new Uint8Array([0, 8]);
      yield new Uint8Array([16, 24, 32, 40, 48, 56]);
      yield new Uint8Array([1, 2, 3, 4]);
      yield new Uint8Array([5, 6, 7, 8]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator));

    expect(await tokenizer.readUint8Array(2)).toEqual(new Uint8Array([0, 8]));
    expect(await tokenizer.readUint8Array(6)).toEqual(new Uint8Array([16, 24, 32, 40, 48, 56]));
    expect(await tokenizer.readUint8Array(4)).toEqual(new Uint8Array([1, 2, 3, 4]));
    expect(await tokenizer.readUint8Array(4)).toEqual(new Uint8Array([5, 6, 7, 8]));
  });

  it('should read Uint8Array from the smaller chunks', async () => {
    function* generator() {
      yield new Uint8Array([0, 8]);
      yield new Uint8Array([16, 24, 32]);
      yield new Uint8Array([40, 48]);
      yield new Uint8Array([56, 1, 2]);
      yield new Uint8Array([3, 4]);
      yield new Uint8Array([5, 6, 7, 8]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator));

    expect(await tokenizer.readUint8Array(2)).toEqual(new Uint8Array([0, 8]));
    expect(await tokenizer.readUint8Array(6)).toEqual(new Uint8Array([16, 24, 32, 40, 48, 56]));
    expect(await tokenizer.readUint8Array(4)).toEqual(new Uint8Array([1, 2, 3, 4]));
    expect(await tokenizer.readUint8Array(4)).toEqual(new Uint8Array([5, 6, 7, 8]));
  });

  it('should read Uint8Array from the larger chunks', async () => {
    function* generator() {
      yield new Uint8Array([0, 8]);
      yield new Uint8Array([16, 24, 32, 40, 48, 56]);
      yield new Uint8Array([1, 2, 3, 4]);
      yield new Uint8Array([5, 6, 7, 8]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator));

    expect(await tokenizer.readUint8Array(2)).toEqual(new Uint8Array([0, 8]));
    expect(await tokenizer.readUint8Array(6)).toEqual(new Uint8Array([16, 24, 32, 40, 48, 56]));
    expect(await tokenizer.readUint8Array(4)).toEqual(new Uint8Array([1, 2, 3, 4]));
    expect(await tokenizer.readUint8Array(4)).toEqual(new Uint8Array([5, 6, 7, 8]));
  });

  it('should throw an error when no data is available', async () => {
    async function task() {
      function* generator() {
        yield new Uint8Array([1, 2, 3]);
      }

      const tokenizer = new Tokenizer(createMockReadableStream(generator));

      await tokenizer.readUint32();
    }

    await expect(task()).rejects
      .toThrowError(new FinishedStreamError('ReadableStream has been finished'));
  });

  it('should throw an error on reading from the closed stream', async () => {
    async function task() {
      function* generator() {
        yield new Uint8Array([1, 2, 3, 4]);
        throw new Error('Abort');
      }

      const tokenizer = new Tokenizer(createMockReadableStream(generator));

      await tokenizer.readUint32();
      await tokenizer.readUint32();
    }

    await expect(task()).rejects
      .toThrowError(new Error('Abort'));
  });
});
