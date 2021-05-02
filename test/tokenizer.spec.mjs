import assert from 'assert';
import { Tokenizer } from '../lib/tokenizer.mjs';
import { createMockReadableStream } from './createMockReadableStream.mjs';

const unfinishedPromise = new Promise(() => {});

describe('Tokenizer', () => {
  it('should read Uint32', async () => {
    function* generator() {
      yield new Uint8Array([0, 8, 16, 24]);
      yield new Uint8Array([32, 40, 48, 56, 1, 2]);
      yield new Uint8Array([3, 4]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator, unfinishedPromise));

    assert.strictEqual(await tokenizer.readUint32(), 528408);
    assert.strictEqual(await tokenizer.readUint32(), 539504696);
    assert.strictEqual(await tokenizer.readUint32(), 16909060);
  });

  it('should read Uint8Array', async () => {
    function* generator() {
      yield new Uint8Array([0, 8, 16, 24]);
      yield new Uint8Array([32, 40, 48, 56, 1, 2]);
      yield new Uint8Array([3, 4]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator, unfinishedPromise));

    assert.deepStrictEqual(await tokenizer.readUint8Array(2), new Uint8Array([0, 8]));
    assert.deepStrictEqual(await tokenizer.readUint8Array(6), new Uint8Array([16, 24, 32, 40, 48, 56]));
  });

  it('should throw an error when no data is available', async () => {
    function* generator() {
      yield new Uint8Array([1, 2, 3]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator, unfinishedPromise));

    await assert.rejects(async () => {
      await tokenizer.readUint32();
    }, (err) => {
      assert.strictEqual(err.name, 'Error');
      assert.strictEqual(err.message, 'ReadableStream has been finished');
      return true;
    });
  });

  it('should throw an error on reading from the closed stream', async () => {
    let reject;
    const closed = new Promise((_resolve, _reject) => reject = _reject);

    function* generator() {
      yield new Uint8Array([1, 2, 3, 4]);

      reject(new Error('Abort'));

      yield new Uint8Array([1, 2, 3, 4]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator, closed));

    await assert.rejects(async () => {
      await tokenizer.readUint32();
      await tokenizer.readUint32();
    }, (err) => {
      assert.strictEqual(err.name, 'Error');
      assert.strictEqual(err.message, 'Abort');
      return true;
    });
  });
});
