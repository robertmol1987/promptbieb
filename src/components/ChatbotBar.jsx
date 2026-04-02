import { ExternalLink, Star } from "lucide-react";

export function ChatbotBar({ chatbots, filterFavoriet, onToggleFavoriet }) {
  if (!chatbots || chatbots.length === 0) return null;

  return (
    <div
      className="flex-shrink-0 overflow-x-auto"
      style={{
        backgroundColor: "#163d32",
        borderBottom: "2px solid rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-center gap-1 px-4 py-2">
        <span
          className="text-xs font-medium mr-2 flex-shrink-0"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Chatbots:
        </span>
        {chatbots.map((bot, idx) => (
          <a
            key={idx}
            href={bot.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-md transition-all flex-shrink-0"
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.85)";
            }}
          >
            {bot.name}
            <ExternalLink size={11} style={{ opacity: 0.5 }} />
          </a>
        ))}

        {/* Spacer to push favoriet filter to the right */}
        <div style={{ flex: 1 }} />

        {/* Favoriet van Robert filter toggle */}
        <button
          onClick={onToggleFavoriet}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all flex-shrink-0"
          style={{
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
            backgroundColor: filterFavoriet
              ? "rgba(234,179,8,0.25)"
              : "rgba(255,255,255,0.06)",
            border: filterFavoriet
              ? "1px solid rgba(234,179,8,0.5)"
              : "1px solid rgba(255,255,255,0.08)",
            color: filterFavoriet ? "#fde047" : "rgba(255,255,255,0.85)",
          }}
          onMouseEnter={(e) => {
            if (!filterFavoriet) {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "#FFFFFF";
            }
          }}
          onMouseLeave={(e) => {
            if (!filterFavoriet) {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.85)";
            }
          }}
          title="Toon alleen favorieten van Robert"
        >
          <Star
            size={14}
            fill={filterFavoriet ? "#fde047" : "none"}
            style={{ flexShrink: 0 }}
          />
          <span className="hidden sm:inline">Favoriet van Robert</span>
        </button>
      </div>
    </div>
  );
}
