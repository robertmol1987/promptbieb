import { useState, useCallback, useMemo } from "react";
import {
  Copy,
  Eye,
  Check,
  Search,
  Tag,
  X,
  Star,
  ChevronDown,
} from "lucide-react";
import { PromptDetailModal } from "./PromptDetailModal";

export function PromptList({
  prompts,
  categoryTitle,
  sectionTitle,
  filterFavoriet,
  hoofdcategorieën,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [viewingPrompt, setViewingPrompt] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [localFavoriet, setLocalFavoriet] = useState(false);

  // Collect all unique tags from the current prompts
  const allTags = useMemo(() => {
    const tagSet = new Set();
    for (const p of prompts) {
      for (const t of p.tags) {
        tagSet.add(t);
      }
    }
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "nl"));
  }, [prompts]);

  const handleCopy = useCallback(async (prompt) => {
    const fullText = prompt.name + "\n\n" + prompt.promptText;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedId(prompt.name);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  const isFavorietActive = filterFavoriet || localFavoriet;

  const filteredPrompts = prompts.filter((p) => {
    // Apply favoriet filter (from chatbot bar OR local toggle)
    if (
      isFavorietActive &&
      !p.tags.some((t) => t.toLowerCase() === "favoriet van robert")
    ) {
      return false;
    }
    // Apply tag filter
    if (selectedTag && !p.tags.includes(selectedTag)) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesName = p.name.toLowerCase().includes(q);
    const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCategory = p.categories.some((c) =>
      c.toLowerCase().includes(q),
    );
    return matchesName || matchesTags || matchesCategory;
  });

  // Determine if we should group by hoofdcategorie
  const isGrouped =
    !sectionTitle &&
    (!categoryTitle || categoryTitle === "Alle prompts") &&
    hoofdcategorieën &&
    hoofdcategorieën.length > 0;

  // Build grouped prompts: array of { name, prompts[] } in hoofdcategorie order
  const groupedPrompts = useMemo(() => {
    if (!isGrouped) return [];
    const groups = [];
    for (const hc of hoofdcategorieën) {
      const groupPrompts = filteredPrompts.filter((p) =>
        hc.sections.some((s) => p.section.includes(s)),
      );
      if (groupPrompts.length > 0) {
        groups.push({ name: hc.name, prompts: groupPrompts });
      }
    }
    return groups;
  }, [isGrouped, hoofdcategorieën, filteredPrompts]);

  const title = sectionTitle || categoryTitle || "Alle prompts";

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="p-8 pt-6" style={{ maxWidth: "900px" }}>
        {/* Header */}
        <div className="mb-6">
          <h2
            className="font-bold mb-1"
            style={{ fontSize: "24px", color: "#1A1A1A" }}
          >
            {title}
          </h2>
          <p className="text-sm" style={{ color: "#888" }}>
            {filteredPrompts.length}{" "}
            {filteredPrompts.length === 1 ? "prompt" : "prompts"}
            {searchQuery && ` gevonden voor "${searchQuery}"`}
            {selectedTag && ` met tag "${selectedTag}"`}
            {isFavorietActive && ` — alleen favorieten`}
          </p>
        </div>

        {/* Search bar + tag dropdown + favoriet button */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          {/* Search input */}
          <div className="relative" style={{ flex: 1 }}>
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#999" }}
            />
            <input
              type="text"
              placeholder="Zoek op naam of tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm"
              style={{
                border: "2px solid #E5E7EB",
                outline: "none",
                fontSize: "14px",
                color: "#333",
                backgroundColor: "#FAFAFA",
                height: "44px",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#1d4a3c";
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.backgroundColor = "#FAFAFA";
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#999" }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Tag dropdown */}
          <div className="relative" style={{ minWidth: "180px" }}>
            <Tag
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#999", pointerEvents: "none" }}
            />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
              style={{
                border: selectedTag ? "2px solid #1d4a3c" : "2px solid #E5E7EB",
                outline: "none",
                fontSize: "14px",
                color: selectedTag ? "#1d4a3c" : "#666",
                backgroundColor: selectedTag ? "#F0F7F4" : "#FAFAFA",
                height: "44px",
                fontWeight: selectedTag ? 500 : 400,
              }}
            >
              <option value="">Alle tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "#999", pointerEvents: "none" }}
            />
          </div>

          {/* Favoriet van Robert toggle */}
          <button
            onClick={() => setLocalFavoriet((prev) => !prev)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg transition-all flex-shrink-0"
            style={{
              border: isFavorietActive
                ? "2px solid #d4a843"
                : "2px solid #E5E7EB",
              backgroundColor: isFavorietActive ? "#FEF9EE" : "#FAFAFA",
              color: isFavorietActive ? "#92700C" : "#666",
              fontSize: "14px",
              fontWeight: isFavorietActive ? 600 : 400,
              height: "44px",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!isFavorietActive) {
                e.currentTarget.style.borderColor = "#d4a843";
                e.currentTarget.style.backgroundColor = "#FFFCF5";
              }
            }}
            onMouseLeave={(e) => {
              if (!isFavorietActive) {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.backgroundColor = "#FAFAFA";
              }
            }}
            title="Toon alleen favorieten van Robert"
          >
            <Star
              size={15}
              fill={isFavorietActive ? "#d4a843" : "none"}
              color={isFavorietActive ? "#d4a843" : "#999"}
              style={{ flexShrink: 0 }}
            />
            <span className="hidden sm:inline">Favoriet</span>
          </button>
        </div>

        {/* Prompt list */}
        <div className="flex flex-col gap-2">
          {isGrouped ? (
            <>
              {groupedPrompts.map((group, gidx) => {
                const groupItems = group.prompts;
                return (
                  <div key={gidx}>
                    {gidx > 0 && (
                      <div
                        style={{
                          height: "2px",
                          backgroundColor: "#E5E7EB",
                          margin: "28px 0",
                        }}
                      />
                    )}
                    <h3
                      className="font-bold mb-3"
                      style={{
                        fontSize: "32px",
                        color: "#1A1A1A",
                        lineHeight: "1.2",
                      }}
                    >
                      {group.name}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {groupItems.map((prompt, idx) => {
                        const isCopied = copiedId === prompt.name;
                        const isFavoriet = prompt.tags.some(
                          (t) => t.toLowerCase() === "favoriet van robert",
                        );
                        const cardBg = isFavoriet ? "#ECFDF5" : "#FAFAFA";
                        const cardBorder = isFavoriet ? "#bbf7d0" : "#EEEEEE";
                        const cardHoverBg = isFavoriet ? "#D1FAE5" : "#F0F7F4";
                        const cardHoverBorder = isFavoriet
                          ? "#86efac"
                          : "#1d4a3c40";
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all"
                            style={{
                              backgroundColor: cardBg,
                              border: `1px solid ${cardBorder}`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                cardHoverBg;
                              e.currentTarget.style.borderColor =
                                cardHoverBorder;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = cardBg;
                              e.currentTarget.style.borderColor = cardBorder;
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div
                                className="font-medium truncate"
                                style={{ fontSize: "15px", color: "#1A1A1A" }}
                              >
                                <span
                                  style={{
                                    color: "#999",
                                    marginRight: "8px",
                                    fontSize: "13px",
                                  }}
                                >
                                  {idx + 1}.
                                </span>
                                {prompt.name}
                              </div>
                              {prompt.tags.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                  <Tag
                                    size={11}
                                    style={{ color: "#999", flexShrink: 0 }}
                                  />
                                  {prompt.tags.slice(0, 4).map((tag, tidx) => (
                                    <span
                                      key={tidx}
                                      className="text-xs px-1.5 py-0.5 rounded"
                                      style={{
                                        backgroundColor: "#E8F0EC",
                                        color: "#1d4a3c",
                                        fontSize: "11px",
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {prompt.tags.length > 4 && (
                                    <span
                                      className="text-xs"
                                      style={{ color: "#999" }}
                                    >
                                      +{prompt.tags.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {/* Copy button */}
                              <button
                                onClick={() => handleCopy(prompt)}
                                className="p-2 rounded-md transition-all"
                                style={{
                                  color: isCopied ? "#16a34a" : "#666",
                                  backgroundColor: isCopied
                                    ? "#dcfce7"
                                    : "transparent",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isCopied)
                                    e.currentTarget.style.backgroundColor =
                                      "#E8F0EC";
                                }}
                                onMouseLeave={(e) => {
                                  if (!isCopied)
                                    e.currentTarget.style.backgroundColor =
                                      "transparent";
                                }}
                                title="Kopieer prompt"
                              >
                                {isCopied ? (
                                  <Check size={18} />
                                ) : (
                                  <Copy size={18} />
                                )}
                              </button>

                              {/* View button */}
                              <button
                                onClick={() => setViewingPrompt(prompt)}
                                className="p-2 rounded-md transition-all"
                                style={{ color: "#666" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#E8F0EC";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "transparent";
                                }}
                                title="Bekijk prompt"
                              >
                                <Eye size={18} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {filteredPrompts.map((prompt, idx) => {
                const isCopied = copiedId === prompt.name;
                const isFavoriet = prompt.tags.some(
                  (t) => t.toLowerCase() === "favoriet van robert",
                );
                const cardBg = isFavoriet ? "#ECFDF5" : "#FAFAFA";
                const cardBorder = isFavoriet ? "#bbf7d0" : "#EEEEEE";
                const cardHoverBg = isFavoriet ? "#D1FAE5" : "#F0F7F4";
                const cardHoverBorder = isFavoriet ? "#86efac" : "#1d4a3c40";
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: cardBg,
                      border: `1px solid ${cardBorder}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = cardHoverBg;
                      e.currentTarget.style.borderColor = cardHoverBorder;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = cardBg;
                      e.currentTarget.style.borderColor = cardBorder;
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium truncate"
                        style={{ fontSize: "15px", color: "#1A1A1A" }}
                      >
                        <span
                          style={{
                            color: "#999",
                            marginRight: "8px",
                            fontSize: "13px",
                          }}
                        >
                          {idx + 1}.
                        </span>
                        {prompt.name}
                      </div>
                      {prompt.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <Tag
                            size={11}
                            style={{ color: "#999", flexShrink: 0 }}
                          />
                          {prompt.tags.slice(0, 4).map((tag, tidx) => (
                            <span
                              key={tidx}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: "#E8F0EC",
                                color: "#1d4a3c",
                                fontSize: "11px",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {prompt.tags.length > 4 && (
                            <span className="text-xs" style={{ color: "#999" }}>
                              +{prompt.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Copy button */}
                      <button
                        onClick={() => handleCopy(prompt)}
                        className="p-2 rounded-md transition-all"
                        style={{
                          color: isCopied ? "#16a34a" : "#666",
                          backgroundColor: isCopied ? "#dcfce7" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isCopied)
                            e.currentTarget.style.backgroundColor = "#E8F0EC";
                        }}
                        onMouseLeave={(e) => {
                          if (!isCopied)
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                        }}
                        title="Kopieer prompt"
                      >
                        {isCopied ? <Check size={18} /> : <Copy size={18} />}
                      </button>

                      {/* View button */}
                      <button
                        onClick={() => setViewingPrompt(prompt)}
                        className="p-2 rounded-md transition-all"
                        style={{ color: "#666" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#E8F0EC";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        title="Bekijk prompt"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {filteredPrompts.length === 0 && (
            <div className="text-center py-12" style={{ color: "#999" }}>
              <Search
                size={32}
                style={{ margin: "0 auto 12px", opacity: 0.3 }}
              />
              <p className="text-sm">Geen prompts gevonden.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {viewingPrompt && (
        <PromptDetailModal
          prompt={viewingPrompt}
          onClose={() => setViewingPrompt(null)}
          onCopy={() => handleCopy(viewingPrompt)}
          isCopied={copiedId === viewingPrompt.name}
        />
      )}
    </div>
  );
}
