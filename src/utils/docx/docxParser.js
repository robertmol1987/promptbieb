import { readZipEntries, extractTextFile } from "./zipHelpers";
import { extractImages } from "./imageExtractor";
import { parseRelationships } from "./relationshipsParser";
import { parseDocumentXml } from "./xmlParser";

async function parseDocxBuffer(buffer) {
  const entries = readZipEntries(buffer);

  // Extract document.xml
  const xmlString = await extractTextFile(buffer, entries, "word/document.xml");

  // Extract relationships
  let relsMap = {};
  try {
    const relsXml = await extractTextFile(
      buffer,
      entries,
      "word/_rels/document.xml.rels",
    );
    relsMap = parseRelationships(relsXml);
  } catch (e) {
    console.error("Could not parse relationships:", e);
  }

  // Extract images
  const images = await extractImages(buffer, entries);

  // Parse document
  const sections = parseDocumentXml(xmlString, relsMap);

  return { sections, images };
}

export async function fetchAndParseDocx() {
  const cacheBuster = `?t=${Date.now()}`;

  // Fetch both documents in parallel
  const [mainResponse, auteurResponse] = await Promise.all([
    fetch(`/api/docx${cacheBuster}`, { cache: "no-store" }),
    fetch(`/api/docx-auteur${cacheBuster}`, { cache: "no-store" }).catch(
      (e) => {
        console.error("Failed to fetch auteur docx:", e);
        return null;
      },
    ),
  ]);

  if (!mainResponse.ok)
    throw new Error(`Failed to fetch document: ${mainResponse.status}`);
  const mainBuffer = await mainResponse.arrayBuffer();
  const mainData = await parseDocxBuffer(mainBuffer);

  // Parse auteur document if available
  let auteurData = null;
  if (auteurResponse && auteurResponse.ok) {
    try {
      const auteurBuffer = await auteurResponse.arrayBuffer();
      auteurData = await parseDocxBuffer(auteurBuffer);
    } catch (e) {
      console.error("Failed to parse auteur docx:", e);
    }
  }

  return {
    sections: mainData.sections,
    images: mainData.images,
    auteurSections: auteurData ? auteurData.sections : null,
    auteurImages: auteurData ? auteurData.images : {},
  };
}
