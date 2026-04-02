export function parseRelationships(relsXml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(relsXml, "text/xml");
  const rels = doc.getElementsByTagName("Relationship");
  const map = {};
  for (const rel of rels) {
    const id = rel.getAttribute("Id");
    const target = rel.getAttribute("Target");
    const type = rel.getAttribute("Type");
    if (type && type.includes("/image") && target) {
      // Target is like "media/image1.png"
      const shortName = target.replace("media/", "");
      map[id] = shortName;
    }
  }
  return map;
}
