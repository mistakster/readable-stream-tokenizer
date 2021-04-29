import assert from 'assert';
import { Tokenizer } from '../lib/tokenizer.mjs';
import { createMockReadableStream } from './createMockReadableStream.mjs';

describe('Tokenizer', () => {
  it('should read Uint32', async () => {
    function* generator() {
      yield new Uint8Array([0, 8, 16, 24]);
      yield new Uint8Array([32, 40, 48, 56, 1, 2]);
      yield new Uint8Array([3, 4]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator));

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

    const tokenizer = new Tokenizer(createMockReadableStream(generator));

    assert.deepStrictEqual(await tokenizer.readUint8Array(2), new Uint8Array([0, 8]));
    assert.deepStrictEqual(await tokenizer.readUint8Array(6), new Uint8Array([16, 24, 32, 40, 48, 56]));
  });

  it('should throw an error when no data is available', async () => {
    function* generator() {
      yield new Uint8Array([1, 2, 3]);
    }

    const tokenizer = new Tokenizer(createMockReadableStream(generator));

    await assert.rejects(async () => {
      await tokenizer.readUint32();
    }, (err) => {
      assert.strictEqual(err.name, 'Error');
      assert.strictEqual(err.message, 'ReadableStream has been finished');
      return true;
    });
  });
});
