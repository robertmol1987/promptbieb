import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  AlertCircle,
  BookOpen,
  List,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Layers,
  Bot,
  User,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import { RichText } from "./Content/RichText";

const COLLAPSED_SECTIONS = ["Oudere prompts (t/m 2025)", "Fun"];

export function CategorySidebar({
  categories,
  sectionOrder,
  chatbotModels,
  prompts,
  selectedCategory,
  selectedSection,
  selectedChatbot,
  onSelectCategory,
  onSelectSection,
  onSelectChatbot,
  isLoading,
  error,
  showIntro,
  onShowIntro,
  showAuthor,
  onShowAuthor,
  hasAuthor,
  authorLinks,
  edited,
  images,
  hoofdcategorieën,
  hasTraining,
  showTraining,
  onShowTraining,
}) {
  const [sectiesOpen, setSectiesOpen] = useState(true);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const hcList =
    hoofdcategorieën && hoofdcategorieën.length > 0 ? hoofdcategorieën : null;

  // Initialize expandedSections when hoofdcategorieën changes
  useEffect(() => {
    if (hcList) {
      setExpandedSections((prev) => {
        const next = { ...prev };
        for (const hc of hcList) {
          if (next[hc.name] === undefined) {
            next[hc.name] = !COLLAPSED_SECTIONS.some(
              (c) => hc.name.toLowerCase() === c.toLowerCase(),
            );
          }
        }
        return next;
      });
    }
  }, [hcList]);

  const toggleSection = (name) => {
    setExpandedSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // For each hoofdcategorie, compute which categories appear in its prompts
  const hcCategories = useMemo(() => {
    if (!hcList || !prompts) return {};
    const map = {};
    for (const hc of hcList) {
      const hcPrompts = prompts.filter((p) =>
        hc.sections.some((s) => p.section.includes(s)),
      );
      const cats = new Set();
      for (const p of hcPrompts) {
        for (const c of p.categories) {
          cats.add(c);
        }
      }
      map[hc.name] = Array.from(cats).sort((a, b) => a.localeCompare(b, "nl"));
    }
    return map;
  }, [hcList, prompts]);

  const isAllePromptsActive =
    !showIntro &&
    !showAuthor &&
    !selectedSection &&
    (selectedCategory === "Alle prompts" || !selectedCategory);

  return (
    <aside
      className="hidden md:flex flex-col w-[300px] flex-shrink-0"
      style={{
        backgroundColor: "#1d4a3c",
        borderRight: "4px solid rgba(255,255,255,0.1)",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div className="p-4 pt-3">
        {isLoading && (
          <div
            className="flex items-center gap-2 py-8 justify-center"
            style={{ color: "#DADADA" }}
          >
            <Loader2 size={18} className="loader-spin" />
            <span className="text-sm">Laden…</span>
          </div>
        )}
        {error && (
          <div
            className="flex items-center gap-2 py-4 px-3"
            style={{ color: "#ff8888" }}
          >
            <AlertCircle size={16} />
            <span className="text-sm">Kon document niet laden</span>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Welkom! */}
            <SidebarButton
              icon={<BookOpen size={16} style={{ opacity: 0.7 }} />}
              label="Welkom!"
              isActive={showIntro}
              onClick={onShowIntro}
              bold
            />

            {/* Over de auteur */}
            {hasAuthor && (
              <SidebarButton
                icon={<User size={16} style={{ opacity: 0.7 }} />}
                label="Over de auteur"
                isActive={showAuthor}
                onClick={onShowAuthor}
                bold
              />
            )}

            {/* Ook van deze auteur — flyout */}
            {authorLinks && authorLinks.length > 0 && (
              <AuthorLinksButton links={authorLinks} />
            )}

            {/* Trainingen */}
            {hasTraining && (
              <SidebarButton
                icon={<GraduationCap size={16} style={{ opacity: 0.7 }} />}
                label="Trainingen"
                isActive={showTraining}
                onClick={onShowTraining}
                bold
              />
            )}

            <Divider />

            {/* Alle prompts */}
            <SidebarButton
              icon={<List size={16} style={{ opacity: 0.7 }} />}
              label="Alle prompts"
              isActive={isAllePromptsActive}
              onClick={() => onSelectCategory("Alle prompts")}
              count={prompts ? prompts.length : 0}
              bold
            />

            <Divider />

            {/* Secties — merged dropdown with categories per section */}
            {hcList && hcList.length > 0 && (
              <DropdownSection
                icon={<Layers size={14} style={{ opacity: 0.6 }} />}
                title="Secties"
                isOpen={sectiesOpen}
                onToggle={() => setSectiesOpen(!sectiesOpen)}
              >
                {hcList.map((hc) => {
                  const hcPrompts = prompts.filter((p) =>
                    hc.sections.some((s) => p.section.includes(s)),
                  );
                  const promptCount = hcPrompts.length;
                  const isExpanded = !!expandedSections[hc.name];
                  const catsForSection = hcCategories[hc.name] || [];
                  const isSectionActive =
                    !showIntro && !showAuthor && selectedSection === hc.name;

                  return (
                    <div key={hc.name}>
                      {/* Section header — click name to filter, click chevron to expand/collapse */}
                      <div
                        className="flex items-center gap-1 rounded-lg transition-all"
                        style={{
                          backgroundColor: isSectionActive
                            ? "rgba(255,255,255,0.12)"
                            : "transparent",
                          borderLeft: isSectionActive
                            ? "3px solid #D4A843"
                            : "3px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSectionActive)
                            e.currentTarget.style.backgroundColor =
                              "rgba(255,255,255,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSectionActive)
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                        }}
                      >
                        <button
                          onClick={() => toggleSection(hc.name)}
                          className="flex-shrink-0 p-2"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          {isExpanded ? (
                            <ChevronDown size={13} />
                          ) : (
                            <ChevronRight size={13} />
                          )}
                        </button>
                        <button
                          onClick={() => onSelectSection(hc.name)}
                          className="flex-1 text-left flex items-center justify-between gap-2 py-2 pr-3"
                          style={{
                            color: isSectionActive
                              ? "#FFFFFF"
                              : "rgba(255,255,255,0.75)",
                            fontSize: "14px",
                            fontWeight: 600,
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
                            {hc.name}
                          </span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.6)",
                            }}
                          >
                            {promptCount}
                          </span>
                        </button>
                      </div>

                      {/* Categories within this section */}
                      {isExpanded && catsForSection.length > 0 && (
                        <div className="mt-0.5 mb-1">
                          {catsForSection.map((cat) => {
                            const isActive =
                              !showIntro &&
                              !showAuthor &&
                              !selectedSection &&
                              selectedCategory === cat;
                            const sectionPrompts = prompts.filter(
                              (p) =>
                                hc.sections.some((s) =>
                                  p.section.includes(s),
                                ) && p.categories.includes(cat),
                            );
                            const count = sectionPrompts.length;
                            return (
                              <SidebarButton
                                key={cat}
                                label={cat}
                                isActive={isActive}
                                onClick={() => onSelectCategory(cat)}
                                count={count}
                                indent
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </DropdownSection>
            )}

            {/* Specifiek voor chatbot dropdown */}
            {chatbotModels && chatbotModels.length > 0 && (
              <DropdownSection
                icon={<Bot size={14} style={{ opacity: 0.6 }} />}
                title="Specifiek voor chatbot..."
                isOpen={chatbotOpen}
                onToggle={() => setChatbotOpen(!chatbotOpen)}
              >
                {chatbotModels.map((model) => {
                  const isActive = selectedChatbot === model;
                  const promptCount = prompts
                    ? prompts.filter((p) => p.taalmodel === model).length
                    : 0;
                  return (
                    <SidebarButton
                      key={model}
                      label={model}
                      isActive={isActive}
                      onClick={() => onSelectChatbot(isActive ? null : model)}
                      count={promptCount}
                      indent
                    />
                  );
                })}
              </DropdownSection>
            )}

            {/* Edited section content */}
            {edited && edited.content && edited.content.length > 0 && (
              <>
                <Divider />
                <div
                  style={{
                    padding: "12px",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  {edited.content.map((item, idx) => {
                    if (!item.parts || item.parts.length === 0) return null;
                    return (
                      <p key={idx} style={{ margin: "0 0 8px 0" }}>
                        <RichText parts={item.parts} images={images} />
                      </p>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: "1px",
        backgroundColor: "rgba(255,255,255,0.1)",
        margin: "6px 0",
      }}
    />
  );
}

function DropdownSection({ icon, title, isOpen, onToggle, children }) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: "13px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {isOpen ? (
          <ChevronDown size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
        ) : (
          <ChevronRight size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
        )}
        {icon}
        {title}
      </button>
      {isOpen && <div className="mt-0.5">{children}</div>}
    </div>
  );
}

function SidebarButton({
  icon,
  label,
  isActive,
  onClick,
  count,
  bold,
  indent,
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all"
      style={{
        backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
        color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.75)",
        borderLeft: isActive ? "3px solid #D4A843" : "3px solid transparent",
        fontSize: "14px",
        fontWeight: bold ? 600 : 400,
        paddingLeft: indent ? "28px" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!isActive)
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <span
        className="flex items-center gap-2"
        style={{ flex: 1, minWidth: 0 }}
      >
        {icon}
        <span className="whitespace-pre-wrap">{label}</span>
      </span>
      {count !== undefined && (
        <span
          className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function AuthorLinksButton({ links }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const flyoutRef = useRef(null);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });

  const toggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setFlyoutPos({
        top: rect.top,
        left: rect.right + 8,
      });
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e) => {
      if (
        flyoutRef.current &&
        !flyoutRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggle}
        className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
        style={{
          backgroundColor: isOpen ? "rgba(255,255,255,0.12)" : "transparent",
          color: isOpen ? "#FFFFFF" : "rgba(255,255,255,0.75)",
          borderLeft: isOpen ? "3px solid #D4A843" : "3px solid transparent",
          fontSize: "14px",
          fontWeight: 600,
        }}
        onMouseEnter={(e) => {
          if (!isOpen)
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <ExternalLink size={16} style={{ opacity: 0.7, flexShrink: 0 }} />
        <span className="truncate">Ook van deze auteur</span>
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={flyoutRef}
            style={{
              position: "fixed",
              top: flyoutPos.top + "px",
              left: flyoutPos.left + "px",
              backgroundColor: "#1a4a38",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              padding: "8px 0",
              minWidth: "220px",
              zIndex: 9999,
            }}
          >
            {links.map((link, idx) => {
              if (link.href) {
                return (
                  <a
                    key={idx}
                    href={link.href}
                    style={{
                      display: "block",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.85)",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                    }}
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <span
                  key={idx}
                  style={{
                    display: "block",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.4)",
                    whiteSpace: "nowrap",
                    fontStyle: "italic",
                  }}
                >
                  {link.label}
                </span>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
