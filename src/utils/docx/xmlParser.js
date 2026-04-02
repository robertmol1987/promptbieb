function getDrawingImageRIds(element) {
  const nsA = "http://schemas.openxmlformats.org/drawingml/2006/main";
  const nsWpDr =
    "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing";
  const nsR =
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

  const images = [];

  const anchors = element.getElementsByTagNameNS(nsWpDr, "anchor");
  const isAnchored = anchors.length > 0;

  let hAlign = "left";
  let wrapType = "none";

  if (isAnchored) {
    const anchor = anchors[0];

    const posH = anchor.getElementsByTagNameNS(nsWpDr, "positionH")[0];
    if (posH) {
      const alignEl = posH.getElementsByTagNameNS(nsWpDr, "align")[0];
      if (alignEl) {
        hAlign = alignEl.textContent.trim().toLowerCase();
      } else {
        const offsetEl = posH.getElementsByTagNameNS(nsWpDr, "posOffset")[0];
        if (offsetEl) {
          const offsetEmu = parseInt(offsetEl.textContent || "0");
          if (offsetEmu > 3290000) {
            hAlign = "right";
          } else if (offsetEmu > 1740000) {
            hAlign = "center";
          } else {
            hAlign = "left";
          }
        }
      }
    }

    if (anchor.getElementsByTagNameNS(nsWpDr, "wrapSquare").length > 0) {
      wrapType = "square";
    } else if (anchor.getElementsByTagNameNS(nsWpDr, "wrapTight").length > 0) {
      wrapType = "tight";
    } else if (
      anchor.getElementsByTagNameNS(nsWpDr, "wrapThrough").length > 0
    ) {
      wrapType = "through";
    } else if (
      anchor.getElementsByTagNameNS(nsWpDr, "wrapTopAndBottom").length > 0
    ) {
      wrapType = "topAndBottom";
    } else if (anchor.getElementsByTagNameNS(nsWpDr, "wrapNone").length > 0) {
      wrapType = "none";
    }
  }

  const blips = element.getElementsByTagNameNS(nsA, "blip");
  for (const blip of blips) {
    const rId = blip.getAttributeNS(nsR, "embed");
    if (rId) {
      let widthEmu = 0;
      let heightEmu = 0;

      const drawing = findAncestor(blip, "drawing");
      if (drawing) {
        const extents = drawing.getElementsByTagNameNS(nsWpDr, "extent");
        if (extents.length > 0) {
          widthEmu = parseInt(extents[0].getAttribute("cx") || "0");
          heightEmu = parseInt(extents[0].getAttribute("cy") || "0");
        }
        if (!widthEmu) {
          const aExts = drawing.getElementsByTagNameNS(nsA, "ext");
          for (const ext of aExts) {
            const cx = parseInt(ext.getAttribute("cx") || "0");
            const cy = parseInt(ext.getAttribute("cy") || "0");
            if (cx && cy) {
              widthEmu = cx;
              heightEmu = cy;
              break;
            }
          }
        }
      }

      const widthPx = widthEmu ? Math.round(widthEmu / 9525) : 0;
      const heightPx = heightEmu ? Math.round(heightEmu / 9525) : 0;

      images.push({ rId, widthPx, heightPx, isAnchored, hAlign, wrapType });
    }
  }

  return images;
}

function findAncestor(el, localName) {
  let current = el.parentElement;
  while (current) {
    if (current.localName === localName) return current;
    current = current.parentElement;
  }
  return null;
}

function getTextFromParagraph(pEl, ns) {
  const parts = [];

  for (const child of pEl.childNodes) {
    if (child.nodeType !== 1) continue;

    const localName = child.localName;

    if (localName === "r" && child.namespaceURI === ns) {
      const rPr = child.getElementsByTagNameNS(ns, "rPr")[0];
      const isBold = rPr?.getElementsByTagNameNS(ns, "b").length > 0;
      const isItalic = rPr?.getElementsByTagNameNS(ns, "i").length > 0;
      const isUnderline = rPr?.getElementsByTagNameNS(ns, "u").length > 0;

      let fontSize = null;
      const szEl = rPr?.getElementsByTagNameNS(ns, "sz")[0];
      if (szEl) {
        const halfPoints = parseInt(szEl.getAttribute("w:val") || "0");
        if (halfPoints) {
          fontSize = `${halfPoints / 2}pt`;
        }
      }

      let fontFamily = null;
      const rFontsEl = rPr?.getElementsByTagNameNS(ns, "rFonts")[0];
      if (rFontsEl) {
        fontFamily =
          rFontsEl.getAttribute("w:ascii") ||
          rFontsEl.getAttribute("w:hAnsi") ||
          rFontsEl.getAttribute("w:cs");
      }

      let color = null;
      const colorEl = rPr?.getElementsByTagNameNS(ns, "color")[0];
      if (colorEl) {
        const colorVal = colorEl.getAttribute("w:val");
        if (colorVal && colorVal !== "auto") {
          color = `#${colorVal}`;
        }
      }

      const drawings = child.getElementsByTagNameNS(ns, "drawing");
      if (drawings.length > 0) {
        for (const drawing of drawings) {
          const imgRefs = getDrawingImageRIds(drawing);
          for (const imgRef of imgRefs) {
            parts.push({
              type: "image",
              rId: imgRef.rId,
              widthPx: imgRef.widthPx,
              heightPx: imgRef.heightPx,
              isAnchored: imgRef.isAnchored,
              hAlign: imgRef.hAlign,
              wrapType: imgRef.wrapType,
            });
          }
        }
      }

      const textEls = child.getElementsByTagNameNS(ns, "t");
      let text = "";
      for (const t of textEls) text += t.textContent;
      if (text) {
        parts.push({
          text,
          bold: isBold,
          italic: isItalic,
          underline: isUnderline,
          fontSize,
          fontFamily,
          color,
        });
      }
    }

    if (localName === "hyperlink") {
      const hlRuns = child.getElementsByTagNameNS(ns, "r");
      for (const run of hlRuns) {
        const rPr = run.getElementsByTagNameNS(ns, "rPr")[0];

        let fontSize = null;
        const szEl = rPr?.getElementsByTagNameNS(ns, "sz")[0];
        if (szEl) {
          const halfPoints = parseInt(szEl.getAttribute("w:val") || "0");
          if (halfPoints) {
            fontSize = `${halfPoints / 2}pt`;
          }
        }

        let fontFamily = null;
        const rFontsEl = rPr?.getElementsByTagNameNS(ns, "rFonts")[0];
        if (rFontsEl) {
          fontFamily =
            rFontsEl.getAttribute("w:ascii") ||
            rFontsEl.getAttribute("w:hAnsi") ||
            rFontsEl.getAttribute("w:cs");
        }

        let color = null;
        const colorEl = rPr?.getElementsByTagNameNS(ns, "color")[0];
        if (colorEl) {
          const colorVal = colorEl.getAttribute("w:val");
          if (colorVal && colorVal !== "auto") {
            color = `#${colorVal}`;
          }
        }

        const textEls = run.getElementsByTagNameNS(ns, "t");
        let text = "";
        for (const t of textEls) text += t.textContent;
        if (text) {
          parts.push({
            text,
            bold: false,
            italic: false,
            underline: true,
            link: true,
            fontSize,
            fontFamily,
            color,
          });
        }
      }
    }
  }

  // ---- Pattern detection: &&&url&&& and ###text### ----
  // Word splits text into runs with arbitrary formatting differences.
  // We must concatenate ALL text (regardless of formatting) to find patterns,
  // then rebuild parts based on what we find.

  // Separate image parts from text parts, preserving order info
  const imageParts = [];
  const textOnlyParts = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].type === "image") {
      imageParts.push(parts[i]);
    } else {
      textOnlyParts.push(parts[i]);
    }
  }

  // Build one big string from ALL text parts and track char-to-part mapping
  let fullText = "";
  const charToPartIdx = []; // for each char in fullText, which textOnlyParts index it came from
  for (let i = 0; i < textOnlyParts.length; i++) {
    const t = textOnlyParts[i].text || "";
    for (let c = 0; c < t.length; c++) {
      charToPartIdx.push(i);
    }
    fullText += t;
  }

  // Check for patterns
  const hasPatterns =
    fullText.includes("@@@") ||
    fullText.includes("###") ||
    fullText.includes("%%%");

  if (!hasPatterns) {
    // No patterns found, return original parts as-is
    return parts;
  }

  // Find all pattern matches with positions
  const matches = [];
  const patternRegex = /@@@(.+?)@@@|###(.+?)###|%%%(.+?)%%%/g;
  let m;
  while ((m = patternRegex.exec(fullText)) !== null) {
    if (m[1] !== undefined) {
      matches.push({
        type: "iframe",
        url: m[1].trim(),
        start: m.index,
        end: m.index + m[0].length,
      });
    } else if (m[2] !== undefined) {
      matches.push({
        type: "link",
        text: m[2],
        start: m.index,
        end: m.index + m[0].length,
      });
    } else if (m[3] !== undefined) {
      matches.push({
        type: "disclaimer",
        text: m[3],
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }

  if (matches.length === 0) {
    return parts;
  }

  // Helper: get formatting from the source part at a given char position
  const getFormatAt = (charIdx) => {
    const safeIdx = Math.min(charIdx, charToPartIdx.length - 1);
    const partIdx = charToPartIdx[safeIdx] || 0;
    const src = textOnlyParts[partIdx] || {};
    return {
      bold: src.bold || false,
      italic: src.italic || false,
      underline: src.underline || false,
      link: src.link || false,
      fontSize: src.fontSize || null,
      fontFamily: src.fontFamily || null,
      color: src.color || null,
    };
  };

  // Rebuild parts: text before match, the match, text after match, etc.
  const finalParts = [...imageParts]; // images first
  let cursor = 0;

  for (const match of matches) {
    // Text before this match
    if (cursor < match.start) {
      const beforeText = fullText.slice(cursor, match.start);
      if (beforeText) {
        const fmt = getFormatAt(cursor);
        finalParts.push({ text: beforeText, ...fmt });
      }
    }

    // The match itself
    if (match.type === "iframe") {
      finalParts.push({ type: "iframe", url: match.url });
    } else if (match.type === "link") {
      const fmt = getFormatAt(match.start);
      // Split on ; — first part is display text, second part is URL
      const semiIdx = match.text.indexOf(";");
      let displayText = match.text;
      let href = null;
      if (semiIdx > 0) {
        displayText = match.text.substring(0, semiIdx).trim();
        href = match.text.substring(semiIdx + 1).trim();
      }
      finalParts.push({
        text: displayText,
        href: href,
        link: true,
        underline: true,
        fontSize: fmt.fontSize,
        fontFamily: fmt.fontFamily,
        color: fmt.color,
      });
    } else if (match.type === "disclaimer") {
      // Split on ; — first part is title, second part is content
      const semiIdx = match.text.indexOf(";");
      let title = match.text;
      let content = "";
      if (semiIdx > 0) {
        title = match.text.substring(0, semiIdx).trim();
        content = match.text.substring(semiIdx + 1).trim();
      }
      finalParts.push({
        type: "disclaimer",
        disclaimerTitle: title,
        disclaimerContent: content,
      });
    }

    cursor = match.end;
  }

  // Text after the last match
  if (cursor < fullText.length) {
    const afterText = fullText.slice(cursor);
    if (afterText) {
      const fmt = getFormatAt(cursor);
      finalParts.push({ text: afterText, ...fmt });
    }
  }

  return finalParts;
}

function getParagraphSpacing(pEl, ns) {
  const pPr = pEl.getElementsByTagNameNS(ns, "pPr")[0];
  if (!pPr) return {};

  const spacingEl = pPr.getElementsByTagNameNS(ns, "spacing")[0];
  if (!spacingEl) return {};

  const spacing = {};

  const lineVal = spacingEl.getAttribute("w:line");
  const lineRule = spacingEl.getAttribute("w:lineRule");

  if (lineVal) {
    if (lineRule === "auto") {
      const lines = parseInt(lineVal) / 240;
      spacing.lineHeight = lines.toFixed(2);
    } else if (lineRule === "exact" || lineRule === "atLeast") {
      const points = parseInt(lineVal) / 20;
      spacing.lineHeight = `${points}pt`;
    }
  }

  const beforeVal = spacingEl.getAttribute("w:before");
  if (beforeVal) {
    const points = parseInt(beforeVal) / 20;
    spacing.spacingBefore = `${points}pt`;
  }

  const afterVal = spacingEl.getAttribute("w:after");
  if (afterVal) {
    const points = parseInt(afterVal) / 20;
    spacing.spacingAfter = `${points}pt`;
  }

  return spacing;
}

function parseTable(tblEl, ns, relsMap) {
  const rows = [];
  const trElements = tblEl.getElementsByTagNameNS(ns, "tr");

  for (const tr of trElements) {
    const cells = [];
    const tcElements = tr.getElementsByTagNameNS(ns, "tc");

    for (const tc of tcElements) {
      const cellParagraphs = tc.getElementsByTagNameNS(ns, "p");
      const cellContent = [];

      for (const p of cellParagraphs) {
        const textParts = getTextFromParagraph(p, ns);
        if (textParts.length > 0) {
          const resolvedParts = textParts.map((part) => {
            if (part.type === "image" && part.rId && relsMap[part.rId]) {
              return { ...part, imageName: relsMap[part.rId] };
            }
            return part;
          });
          cellContent.push({ parts: resolvedParts });
        }
      }

      cells.push({ content: cellContent });
    }

    rows.push({ cells });
  }

  return { rows };
}

export function parseDocumentXml(xmlString, relsMap) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

  const body = doc.getElementsByTagNameNS(ns, "body")[0];
  if (!body) return [];

  const sections = [];
  // Create a preamble section to capture content before the first heading
  let currentSection = {
    id: "section-preamble",
    title: "__preamble__",
    level: 0,
    content: [],
    children: [],
  };
  sections.push(currentSection);

  for (const element of body.children) {
    const localName = element.localName;

    if (localName === "p") {
      const pPr = element.getElementsByTagNameNS(ns, "pPr")[0];
      const pStyle = pPr?.getElementsByTagNameNS(ns, "pStyle")[0];
      const styleVal = pStyle?.getAttribute("w:val") || "";
      const headingMatch =
        styleVal.match(/^Heading(\d+)$/i) ||
        styleVal.match(/^Kop(\d+)$/i) ||
        styleVal.match(/^heading\s*(\d+)$/i) ||
        styleVal.match(/^Titre(\d+)$/i);
      const textParts = getTextFromParagraph(element, ns);
      const spacing = getParagraphSpacing(element, ns);

      const plainText = textParts
        .filter((pt) => pt.text)
        .map((pt) => pt.text)
        .join("");

      const hasImages = textParts.some((pt) => pt.type === "image");
      const hasIframes = textParts.some((pt) => pt.type === "iframe");

      const numPr = pPr?.getElementsByTagNameNS(ns, "numPr")[0];
      const isListItem = !!numPr;
      const listLevel = numPr
        ? parseInt(
            numPr
              .getElementsByTagNameNS(ns, "ilvl")[0]
              ?.getAttribute("w:val") || "0",
          )
        : 0;

      if (headingMatch && plainText.trim()) {
        const level = parseInt(headingMatch[1]);
        currentSection = {
          id: `section-${sections.length}`,
          title: plainText.trim(),
          level,
          content: [],
          children: [],
        };
        sections.push(currentSection);
      } else if (currentSection) {
        const resolvedParts = textParts.map((part) => {
          if (part.type === "image" && part.rId && relsMap[part.rId]) {
            return { ...part, imageName: relsMap[part.rId] };
          }
          return part;
        });

        currentSection.content.push({
          type: isListItem
            ? "list-item"
            : hasIframes
              ? "paragraph"
              : hasImages && !plainText.trim()
                ? "image-block"
                : "paragraph",
          parts: resolvedParts,
          listLevel,
          spacing,
        });
      }
    }

    if (localName === "tbl" && currentSection) {
      const tableData = parseTable(element, ns, relsMap);
      currentSection.content.push({
        type: "table",
        table: tableData,
      });
    }
  }

  return sections;
}
