export function readZipEntries(buffer) {
  const view = new DataView(buffer);
  let eocdOffset = -1;
  for (
    let i = buffer.byteLength - 22;
    i >= Math.max(0, buffer.byteLength - 65557);
    i--
  ) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error("Not a valid ZIP file");

  const cdOffset = view.getUint32(eocdOffset + 16, true);
  const cdCount = view.getUint16(eocdOffset + 10, true);

  const entries = [];
  let offset = cdOffset;
  for (let i = 0; i < cdCount; i++) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;
    const compression = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const fileNameLen = view.getUint16(offset + 28, true);
    const extraLen = view.getUint16(offset + 30, true);
    const commentLen = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const fileName = new TextDecoder().decode(
      new Uint8Array(buffer, offset + 46, fileNameLen),
    );
    entries.push({
      fileName,
      compression,
      compressedSize,
      localHeaderOffset,
    });
    offset += 46 + fileNameLen + extraLen + commentLen;
  }
  return entries;
}

export async function decompressEntry(buffer, entry) {
  const view = new DataView(buffer);
  const localFnLen = view.getUint16(entry.localHeaderOffset + 26, true);
  const localExLen = view.getUint16(entry.localHeaderOffset + 28, true);
  const dataOffset = entry.localHeaderOffset + 30 + localFnLen + localExLen;
  const compressedData = new Uint8Array(
    buffer,
    dataOffset,
    entry.compressedSize,
  );

  if (entry.compression === 0) return compressedData;
  if (entry.compression === 8) {
    const ds = new DecompressionStream("deflate-raw");
    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();
    writer.write(compressedData);
    writer.close();
    const chunks = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const total = chunks.reduce((a, c) => a + c.length, 0);
    const result = new Uint8Array(total);
    let pos = 0;
    for (const c of chunks) {
      result.set(c, pos);
      pos += c.length;
    }
    return result;
  }
  throw new Error("Unsupported compression method");
}

export async function extractTextFile(buffer, entries, targetName) {
  const entry = entries.find((e) => e.fileName === targetName);
  if (!entry) throw new Error(`${targetName} not found in ZIP`);
  const data = await decompressEntry(buffer, entry);
  return new TextDecoder().decode(data);
}

export async function extractBinaryFile(buffer, entries, targetName) {
  const entry = entries.find((e) => e.fileName === targetName);
  if (!entry) return null;
  return decompressEntry(buffer, entry);
}
