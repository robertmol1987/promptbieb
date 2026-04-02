import { decompressEntry } from "./zipHelpers";

function getMimeType(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  const map = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    bmp: "image/bmp",
    svg: "image/svg+xml",
    tiff: "image/tiff",
    tif: "image/tiff",
    webp: "image/webp",
    emf: "image/x-emf",
    wmf: "image/x-wmf",
  };
  return map[ext] || "image/png";
}

export async function extractImages(buffer, entries) {
  const imageEntries = entries.filter(
    (e) =>
      e.fileName.startsWith("word/media/") &&
      /\.(png|jpe?g|gif|bmp|svg|tiff?|webp|emf|wmf)$/i.test(e.fileName),
  );

  const images = {};
  for (const entry of imageEntries) {
    try {
      const data = await decompressEntry(buffer, entry);
      const mime = getMimeType(entry.fileName);
      const blob = new Blob([data], { type: mime });
      const url = URL.createObjectURL(blob);
      // Store by the short name e.g. "image1.png"
      const shortName = entry.fileName.replace("word/media/", "");
      images[shortName] = url;
    } catch (e) {
      console.error("Failed to extract image:", entry.fileName, e);
    }
  }
  return images;
}
