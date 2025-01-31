export class Tokenizer {
    constructor(stream: ReadableStream);
    readUint32(): Promise<number>;
    readUint8Array(length: number): Promise<Uint8Array>;
}
