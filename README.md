# readable-stream-tokenizer

## Description

This module provides a `Tokenizer` class that facilitates the reading of binary data from a ReadableStream.
It allows for reading various types of data such as Uint32 and Uint8Array from the stream asynchronously.

## Usage

To use this module, first, import it into your project:

```javascript
import { Tokenizer } from '@mistakster/readable-stream-tokenizer';
```

Then, you can create an instance of the `Tokenizer` class by passing a ReadableStream as a parameter:

```javascript
const tokenizer = new Tokenizer(stream);
```

## Methods

### `readUint32()`

Reads an Uint32 value from the stream and returns a Promise resolving to the read Uint32 value.

### `readUint8Array(length)`

Reads a Uint8Array of specified length from the stream and returns a Promise resolving to the read Uint8Array.

* `length`: The length of the Uint8Array to read. 

## Example

```javascript
import { Tokenizer } from '@mistakster/readable-stream-tokenizer';

async function readUrl(url, abortController) {
  const res = await fetch(url, {
    signal: abortController.signal
  });

  const tokenizer = new Tokenizer(res.body);

  try {
    const uint32Value = await tokenizer.readUint32();
    console.log("Read Uint32 value:", uint32Value);

    const uint8Array = await tokenizer.readUint8Array(10);
    console.log("Read Uint8Array:", uint8Array);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}
```

## Error Handling

Errors that may occur during reading from the stream are handled within the module.
If the stream is finished before the expected data is read, a `FinishedStreamError` is thrown.

## Note

Ensure that the environment supports ES modules (`import/export` syntax) for using this module.

## License

MIT
