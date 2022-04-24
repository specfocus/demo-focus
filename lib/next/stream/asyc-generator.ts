export default async function* asyncGenerator<T extends WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer> = Uint8Array>(
  reader: ReadableStreamReader<T>
): AsyncIterable<Buffer> {
  while (true) {
    // The `read()` method returns a promise that
    // resolves when a value has been received.
    const { done, value } = await reader.read();
    // Result objects contain two properties:
    // `done`  - `true` if the stream has already given you all its data.
    // `value` - Some data. Always `undefined` when `done` is `true`.
    if (value) {
      yield Buffer.from(value);
    }

    if (done) {
      return;
    }
  }
}
