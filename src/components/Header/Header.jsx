import { Menu, X, Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";

function HeaderRichText({ items, style }) {
  if (!items || items.length === 0) return null;
  return items.map((item, idx) => {
    if (!item.parts) return null;
    return (
      <span key={idx}>
        {item.parts.map((part, pidx) => {
          if (part.link && (part.href || part.text)) {
            const href =
              part.href ||
              (part.text && part.text.startsWith("http")
                ? part.text
                : `https://${part.text}`);
            return (
              <a
                key={pidx}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...style, textDecoration: "underline" }}
                className="hover:opacity-80 transition-opacity"
              >
                {part.text}
              </a>
            );
          }
          if (part.text) {
            return <span key={pidx}>{part.text}</span>;
          }
          return null;
        })}
      </span>
    );
  });
}

export function Header({
  sidebarOpen,
  onToggleSidebar,
  paginaTitel,
  paginaSubtitel,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Build title text for display
  const hasTitel = paginaTitel && paginaTitel.length > 0;
  const hasSubtitel = paginaSubtitel && paginaSubtitel.length > 0;

  return (
    <header
      className="flex items-center justify-between px-8 py-4 flex-shrink-0"
      style={{
        backgroundColor: "#1d4a3c",
        borderBottom: "4px solid rgba(255,255,255,0.15)",
        minHeight: "120px",
      }}
    >
      <div>
        <h1
          className="font-bold leading-tight cursor-pointer hover:opacity-80 transition-opacity"
          style={{ color: "#FFFFFF", fontSize: "36px" }}
          onClick={() => window.location.reload()}
        >
          {hasTitel && (
            <HeaderRichText items={paginaTitel} style={{ color: "#FFFFFF" }} />
          )}
        </h1>
        <div className="mt-1">
          <div>
            <span style={{ color: "#FBFBFB", fontSize: "18px" }}>
              {hasSubtitel && (
                <HeaderRichText
                  items={paginaSubtitel}
                  style={{ color: "#FBFBFB", fontSize: "18px" }}
                />
              )}
            </span>
          </div>
          {hasTitel && (
            <div>
              <span
                style={{ color: "#FBFBFB", fontSize: "14px", opacity: 0.8 }}
              >
                door Robert Mol |{" "}
              </span>
              <a
                href="https://www.digitaledidactiek.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#FBFBFB",
                  fontSize: "14px",
                  opacity: 0.8,
                  textDecoration: "underline",
                }}
                className="hover:opacity-100 transition-opacity"
              >
                www.digitaledidactiek.com
              </a>
              <span
                style={{ color: "#FBFBFB", fontSize: "14px", opacity: 0.8 }}
              >
                {" "}
                |{" "}
              </span>
              <a
                href="https://robertspromptbibliotheek-v2.created.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#FBFBFB",
                  fontSize: "14px",
                  opacity: 0.8,
                  textDecoration: "underline",
                }}
                className="hover:opacity-100 transition-opacity"
              >
                Promptbibliotheek
              </a>
              <span
                style={{ color: "#FBFBFB", fontSize: "14px", opacity: 0.8 }}
              >
                {" / "}
              </span>
              <a
                href="https://robertsdigitaletoolbox.created.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#FBFBFB",
                  fontSize: "14px",
                  opacity: 0.8,
                  textDecoration: "underline",
                }}
                className="hover:opacity-100 transition-opacity"
              >
                Toolbox
              </a>
              <span
                style={{ color: "#FBFBFB", fontSize: "14px", opacity: 0.8 }}
              >
                {" / "}
              </span>
              <a
                href="https://robertswerkvormen.created.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#FBFBFB",
                  fontSize: "14px",
                  opacity: 0.8,
                  textDecoration: "underline",
                }}
                className="hover:opacity-100 transition-opacity"
              >
                Werkvormen
              </a>
              <span
                style={{ color: "#FBFBFB", fontSize: "14px", opacity: 0.8 }}
              >
                {" |"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: "#DADADA" }}
          title="Volledig scherm (F11)"
        >
          <Maximize2 size={22} />
        </button>

        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: "#DADADA" }}
          onClick={onToggleSidebar}
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
