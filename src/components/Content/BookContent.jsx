import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { RichText } from "./RichText";
import { ImageBlock } from "./ImageBlock";
import { TableBlock } from "./TableBlock";

const colors = {
  mainTitle: "#1A1A1A",
};

function getItemPlainText(item) {
  if (!item.parts) return "";
  return item.parts
    .filter((p) => p.text)
    .map((p) => p.text)
    .join("");
}

/**
 * Scan content items for %%% markers that span multiple paragraphs.
 * Groups everything between %%% open and %%% close into a disclaimer block.
 */
function preprocessContentItems(items) {
  const result = [];
  let i = 0;

  while (i < items.length) {
    const text = getItemPlainText(items[i]);

    // Check if this item starts a %%% block
    const openIdx = text.indexOf("%%%");
    if (openIdx !== -1) {
      // Check if the closing %%% is in the same item
      const afterOpen = text.substring(openIdx + 3);
      const closeInSame = afterOpen.indexOf("%%%");

      if (closeInSame !== -1) {
        // Single-item disclaimer — extract title;content
        const inner = afterOpen.substring(0, closeInSame).trim();
        const semiIdx = inner.indexOf(";");
        const title = semiIdx > 0 ? inner.substring(0, semiIdx).trim() : inner;
        const content = semiIdx > 0 ? inner.substring(semiIdx + 1).trim() : "";

        // Add any text before %%% as a normal item
        const before = text.substring(0, openIdx).trim();
        if (before) {
          result.push({ ...items[i], _textOverride: before });
        }

        result.push({
          type: "disclaimer-block",
          disclaimerTitle: title,
          disclaimerContentItems: [],
          disclaimerContentText: content,
        });

        // Add any text after closing %%%
        const after = afterOpen.substring(closeInSame + 3).trim();
        if (after) {
          result.push({ ...items[i], _textOverride: after });
        }

        i++;
        continue;
      }

      // Multi-paragraph disclaimer — collect until closing %%%
      // The first line after %%% contains the title (before ;) and start of content
      const firstContent = afterOpen.trim();
      const semiIdx = firstContent.indexOf(";");
      const title =
        semiIdx > 0 ? firstContent.substring(0, semiIdx).trim() : firstContent;
      const firstBodyText =
        semiIdx > 0 ? firstContent.substring(semiIdx + 1).trim() : "";

      const collectedItems = [];
      if (firstBodyText) {
        collectedItems.push({
          type: "paragraph",
          parts: [{ text: firstBodyText }],
        });
      }

      i++;
      let found = false;
      while (i < items.length) {
        const innerText = getItemPlainText(items[i]);
        const closeIdx = innerText.indexOf("%%%");

        if (closeIdx !== -1) {
          // Found closing %%% — add text before it
          const beforeClose = innerText.substring(0, closeIdx).trim();
          if (beforeClose) {
            collectedItems.push({
              type: "paragraph",
              parts: [{ text: beforeClose }],
            });
          }
          found = true;
          i++;
          break;
        } else {
          collectedItems.push(items[i]);
          i++;
        }
      }

      result.push({
        type: "disclaimer-block",
        disclaimerTitle: title,
        disclaimerContentItems: collectedItems,
        disclaimerContentText: "",
      });

      continue;
    }

    result.push(items[i]);
    i++;
  }

  return result;
}

function DisclaimerBlock({ title, contentItems, contentText, images }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        margin: "16px 0",
        borderRadius: "8px",
        border: "1px solid #E5E7EB",
        overflow: "hidden",
        backgroundColor: "#F8FAFC",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          padding: "12px 16px",
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 600,
          color: "#1d4a3c",
          textAlign: "left",
        }}
      >
        {isOpen ? (
          <ChevronDown size={16} style={{ flexShrink: 0, opacity: 0.6 }} />
        ) : (
          <ChevronRight size={16} style={{ flexShrink: 0, opacity: 0.6 }} />
        )}
        {title}
      </button>
      {isOpen && (
        <div
          style={{
            padding: "12px 16px 14px 40px",
            fontSize: "14px",
            lineHeight: "1.7",
            color: "#444",
            borderTop: "1px solid #E5E7EB",
          }}
        >
          {contentText && (
            <p style={{ margin: "0 0 8px 0", whiteSpace: "pre-wrap" }}>
              {contentText}
            </p>
          )}
          {contentItems.map((item, idx) => {
            if (item.type === "image-block") {
              return (
                <div key={idx} style={{ margin: "12px 0" }}>
                  <ImageBlock parts={item.parts} images={images} />
                </div>
              );
            }
            if (item.type === "table") {
              return (
                <div key={idx} style={{ margin: "12px 0" }}>
                  <TableBlock table={item.table} images={images} />
                </div>
              );
            }
            if (item.type === "list-item") {
              return (
                <div
                  key={idx}
                  className="flex gap-2"
                  style={{ margin: "0 0 4px 0" }}
                >
                  <span style={{ flexShrink: 0 }}>•</span>
                  <span style={{ whiteSpace: "pre-wrap" }}>
                    <RichText parts={item.parts} images={images} />
                  </span>
                </div>
              );
            }
            const isEmpty =
              !item.parts ||
              item.parts.length === 0 ||
              item.parts.every((p) => !p.text || p.text.trim() === "");
            if (isEmpty) return <br key={idx} />;
            return (
              <p
                key={idx}
                style={{ margin: "0 0 8px 0", whiteSpace: "pre-wrap" }}
              >
                <RichText parts={item.parts} images={images} />
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function BookContent({ section, images }) {
  if (!section) return null;

  const contentItems = useMemo(
    () => preprocessContentItems(section.content),
    [section.content],
  );

  return (
    <div style={{ color: colors.mainTitle, width: "100%" }}>
      {/* Section title (H2) — 18pt/24px Bold, 32px margin bottom */}
      <h2
        className="font-work-sans font-bold"
        style={{
          fontSize: "24px",
          marginBottom: "32px",
          color: colors.mainTitle,
          lineHeight: "1.3",
        }}
      >
        {section.title}
      </h2>

      {/* Content — with spacing from Word document */}
      <div>
        {contentItems.map((item, idx) => {
          // Handle disclaimer blocks
          if (item.type === "disclaimer-block") {
            return (
              <DisclaimerBlock
                key={idx}
                title={item.disclaimerTitle}
                contentItems={item.disclaimerContentItems}
                contentText={item.disclaimerContentText}
                images={images}
              />
            );
          }

          // Build paragraph style from Word spacing
          const paragraphStyle = {
            margin: 0, // Reset default margins
            marginBottom: item.type === "list-item" ? "4px" : "16px", // Smaller spacing for list items
          };

          if (item.spacing) {
            if (item.spacing.lineHeight) {
              paragraphStyle.lineHeight = item.spacing.lineHeight;
            }
            if (item.spacing.spacingBefore) {
              paragraphStyle.marginTop = item.spacing.spacingBefore;
            }
            if (item.spacing.spacingAfter) {
              // Use the larger of Word spacing or our minimum
              const wordSpacing = parseFloat(item.spacing.spacingAfter) || 0;
              const minSpacing = item.type === "list-item" ? 4 : 16;
              paragraphStyle.marginBottom =
                Math.max(wordSpacing, minSpacing) + "px";
            }
          }

          // Default line height if not specified
          if (!paragraphStyle.lineHeight) {
            paragraphStyle.lineHeight = "1.6";
          }

          if (item.type === "table") {
            return <TableBlock key={idx} table={item.table} images={images} />;
          }
          if (item.type === "image-block") {
            return <ImageBlock key={idx} parts={item.parts} images={images} />;
          }
          if (item.type === "list-item") {
            const listPad = `${item.listLevel * 20 + 8}px`;
            return (
              <div
                key={idx}
                className="flex gap-2.5"
                style={{
                  paddingLeft: listPad,
                  whiteSpace: "pre-wrap",
                  ...paragraphStyle,
                }}
              >
                <span
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: colors.mainTitle }}
                >
                  •
                </span>
                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                  <RichText parts={item.parts} images={images} />
                </p>
              </div>
            );
          }

          // Check if paragraph is empty
          const isEmpty =
            !item.parts ||
            item.parts.length === 0 ||
            item.parts.every((part) => !part.text || part.text.trim() === "");

          if (isEmpty) {
            // Render empty paragraph as a line break with proper spacing
            return (
              <p
                key={idx}
                style={{
                  width: "100%",
                  minHeight: "1em",
                  whiteSpace: "pre-wrap",
                  ...paragraphStyle,
                }}
              >
                &nbsp;
              </p>
            );
          }

          return (
            <p
              key={idx}
              style={{
                width: "100%",
                whiteSpace: "pre-wrap",
                ...paragraphStyle,
              }}
            >
              <RichText parts={item.parts} images={images} />
            </p>
          );
        })}

        {/* Clear any remaining floats */}
        <div style={{ clear: "both" }} />

        {contentItems.length === 0 && (
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: colors.mainTitle,
              margin: 0,
            }}
          >
            Deze pagina heeft nog geen content.
          </p>
        )}
      </div>
    </div>
  );
}
