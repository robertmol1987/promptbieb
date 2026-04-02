import { X, Copy, Check, Tag, Layers, FolderOpen, Bot } from "lucide-react";

export function PromptDetailModal({ prompt, onClose, onCopy, isCopied }) {
  if (!prompt) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        className="relative w-full rounded-xl shadow-2xl overflow-hidden"
        style={{
          maxWidth: "700px",
          maxHeight: "85vh",
          backgroundColor: "#FFFFFF",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 p-6 pb-4"
          style={{ borderBottom: "1px solid #EEEEEE" }}
        >
          <h3
            className="font-bold"
            style={{ fontSize: "20px", color: "#1A1A1A", flex: 1 }}
          >
            {prompt.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md transition-all flex-shrink-0"
            style={{ color: "#666" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F3F4F6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(85vh - 140px)" }}
        >
          {/* Metadata grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {/* Section */}
            {prompt.section && prompt.section.length > 0 && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{ backgroundColor: "#F8FAFC" }}
              >
                <FolderOpen
                  size={16}
                  style={{ color: "#1d4a3c", marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                  <div
                    className="text-xs font-semibold uppercase"
                    style={{ color: "#888", marginBottom: "2px" }}
                  >
                    Sectie
                  </div>
                  <div style={{ fontSize: "14px", color: "#333" }}>
                    {prompt.section.join(", ")}
                  </div>
                </div>
              </div>
            )}

            {/* Categories */}
            {prompt.categories && prompt.categories.length > 0 && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{ backgroundColor: "#F8FAFC" }}
              >
                <Layers
                  size={16}
                  style={{ color: "#1d4a3c", marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                  <div
                    className="text-xs font-semibold uppercase"
                    style={{ color: "#888", marginBottom: "2px" }}
                  >
                    Categorieën
                  </div>
                  <div style={{ fontSize: "14px", color: "#333" }}>
                    {prompt.categories.join(", ")}
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{ backgroundColor: "#F8FAFC" }}
              >
                <Tag
                  size={16}
                  style={{ color: "#1d4a3c", marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                  <div
                    className="text-xs font-semibold uppercase"
                    style={{ color: "#888", marginBottom: "2px" }}
                  >
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {prompt.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: "#E8F0EC",
                          color: "#1d4a3c",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Taalmodel */}
            {prompt.taalmodel && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{ backgroundColor: "#F8FAFC" }}
              >
                <Bot
                  size={16}
                  style={{ color: "#1d4a3c", marginTop: "2px", flexShrink: 0 }}
                />
                <div>
                  <div
                    className="text-xs font-semibold uppercase"
                    style={{ color: "#888", marginBottom: "2px" }}
                  >
                    Taalmodel
                  </div>
                  <div style={{ fontSize: "14px", color: "#333" }}>
                    {prompt.taalmodel}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prompt text */}
          <div>
            <div
              className="text-xs font-semibold uppercase mb-2"
              style={{ color: "#888" }}
            >
              Prompt tekst
            </div>
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E5E7EB",
                fontSize: "14px",
                lineHeight: "1.7",
                color: "#333",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {prompt.promptText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 p-4 px-6"
          style={{ borderTop: "1px solid #EEEEEE" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: "#F3F4F6",
              color: "#666",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E5E7EB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#F3F4F6";
            }}
          >
            Sluiten
          </button>
          <button
            onClick={onCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: isCopied ? "#16a34a" : "#1d4a3c",
              color: "#FFFFFF",
            }}
            onMouseEnter={(e) => {
              if (!isCopied) e.currentTarget.style.backgroundColor = "#163d32";
            }}
            onMouseLeave={(e) => {
              if (!isCopied) e.currentTarget.style.backgroundColor = "#1d4a3c";
            }}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
            {isCopied ? "Gekopieerd!" : "Kopieer prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
