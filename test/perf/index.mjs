import { performance, createHistogram } from "node:perf_hooks";
import { Tokenizer } from "../../lib/Tokenizer.mjs";

function* generator() {
  while (true) {
    const length = 10 + Math.floor(Math.random() * 1000);
    yield new Uint8Array(length);
  }
}

const tokenizer = new Tokenizer(ReadableStream.from(generator()));

const histogram = createHistogram();

const method = performance.timerify(tokenizer.readUint8Array.bind(tokenizer), {
  histogram
});

for (let i = 0; i < 1e6; i++) {
  await method(1000);
}

console.log(histogram);
