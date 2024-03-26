import { performance, createHistogram } from "node:perf_hooks";
import { getRandomValues } from "node:crypto";
import { Tokenizer } from "../../lib/TokenizerFast.mjs";

function* generator() {
  const random = new Uint8Array(10000);
  let i = 0;

  while (true) {
    if (i === 0) {
      getRandomValues(random);
    }

    const length = 10 + random[i++];
    yield new Uint8Array(length);

    i = (i + 1) % random.length;
  }
}

const tokenizer = new Tokenizer(ReadableStream.from(generator()));

const histogram = createHistogram();

const method = performance.timerify(tokenizer.readUint8Array.bind(tokenizer), {
  histogram
});

for (let i = 0; i < 1e6; i++) {
  await method(1000);
  // if (i % 100000000 === 0) {
  //   await new Promise(resolve => setTimeout(resolve, 100));
  // }
}

console.log(histogram);

try {
  if (global.gc) {
    global.gc();
  } else {
    console.log('GC is not available');
  }
} catch (e) {
  console.log("`node --expose-gc index.js`");
}

await new Promise(resolve => setTimeout(resolve, 10000));
