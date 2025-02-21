export async function readableStreamToArrayBuffer(stream: ReadableStream) {
  // Grab all the chunks of data from the stream.
  const chunks: Array<Uint8Array> = [];
  let totalLength = 0;
  // @ts-ignore
  for await (const chunk of stream) {
    chunks.push(chunk);
    totalLength += chunk.length;
  }

  // Create an appropriately sized array, fill it with the chunks.
  const byteArray = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    byteArray.set(chunk, offset);
    offset += chunk.length;
  }

  return byteArray.buffer;
}

export function compressData(data: ArrayBuffer): Promise<ArrayBuffer> {
  // Generate a compression stream, gather the chunks.
  const blob = new Blob([data]);
  const stream = blob.stream().pipeThrough(new CompressionStream("gzip"));

  return readableStreamToArrayBuffer(stream);
}

export function decompressData(compressed: ArrayBuffer): Promise<ArrayBuffer> {
  const blob = new Blob([compressed]);
  const stream = blob.stream().pipeThrough(new DecompressionStream("gzip"));

  return readableStreamToArrayBuffer(stream);
}
