import { useState, useMemo } from "react";
import {
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

const COLLAPSED_SECTIONS = ["Oudere prompts (t/m 2025)", "Fun"];

export function MobileCategorySidebar({
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
  isOpen,
  onClose,
  showIntro,
  onShowIntro,
  showAuthor,
  onShowAuthor,
  hasAuthor,
  authorLinks,
  hoofdcategorieën,
  hasTraining,
  showTraining,
  onShowTraining,
}) {
  const [sectiesOpen, setSectiesOpen] = useState(true);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [authorLinksOpen, setAuthorLinksOpen] = useState(false);

  const hcList =
    hoofdcategorieën && hoofdcategorieën.length > 0 ? hoofdcategorieën : null;

  const [expandedSections, setExpandedSections] = useState(() => {
    const initial = {};
    if (hoofdcategorieën) {
      for (const hc of hoofdcategorieën) {
        initial[hc.name] = !COLLAPSED_SECTIONS.some(
          (c) => hc.name.toLowerCase() === c.toLowerCase(),
        );
      }
    }
    return initial;
  });

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

  if (!isOpen) return null;

  const isAllePromptsActive =
    !showIntro &&
    !showAuthor &&
    !selectedSection &&
    (selectedCategory === "Alle prompts" || !selectedCategory);

  return (
    <>
      <div
        className="md:hidden fixed inset-0 z-30 bg-black/50"
        onClick={onClose}
      />
      <aside
        className="md:hidden sidebar-slide fixed left-0 bottom-0 w-[280px] z-40 overflow-y-auto"
        style={{
          backgroundColor: "#1d4a3c",
          overflowX: "hidden",
          top: "120px",
        }}
      >
        <div className="p-4 pt-3">
          {/* Welkom! */}
          <MobileSidebarButton
            icon={<BookOpen size={16} style={{ opacity: 0.7 }} />}
            label="Welkom!"
            isActive={showIntro}
            onClick={() => {
              onShowIntro();
              onClose();
            }}
            bold
          />

          {/* Over de auteur */}
          {hasAuthor && (
            <MobileSidebarButton
              icon={<User size={16} style={{ opacity: 0.7 }} />}
              label="Over de auteur"
              isActive={showAuthor}
              onClick={() => {
                onShowAuthor();
                onClose();
              }}
              bold
            />
          )}

          {/* Ook van deze auteur — inline accordion */}
          {authorLinks && authorLinks.length > 0 && (
            <div>
              <button
                onClick={() => setAuthorLinksOpen(!authorLinksOpen)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: authorLinksOpen
                    ? "rgba(255,255,255,0.12)"
                    : "transparent",
                  color: authorLinksOpen ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                  borderLeft: authorLinksOpen
                    ? "3px solid #D4A843"
                    : "3px solid transparent",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                <ExternalLink
                  size={16}
                  style={{ opacity: 0.7, flexShrink: 0 }}
                />
                <span className="truncate">Ook van deze auteur</span>
              </button>
              {authorLinksOpen && (
                <div style={{ paddingLeft: "12px" }}>
                  {authorLinks.map((link, idx) => {
                    if (link.href) {
                      return (
                        <a
                          key={idx}
                          href={link.href}
                          style={{
                            display: "block",
                            padding: "6px 12px",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "rgba(255,255,255,0.75)",
                            textDecoration: "none",
                            borderRadius: "6px",
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
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "rgba(255,255,255,0.35)",
                          borderRadius: "6px",
                          fontStyle: "italic",
                        }}
                      >
                        {link.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Trainingen */}
          {hasTraining && (
            <MobileSidebarButton
              icon={<GraduationCap size={16} style={{ opacity: 0.7 }} />}
              label="Trainingen"
              isActive={showTraining}
              onClick={() => {
                onShowTraining();
                onClose();
              }}
              bold
            />
          )}

          <div
            style={{
              height: "1px",
              backgroundColor: "rgba(255,255,255,0.1)",
              margin: "6px 0",
            }}
          />

          {/* Alle prompts */}
          <MobileSidebarButton
            icon={<List size={16} style={{ opacity: 0.7 }} />}
            label="Alle prompts"
            isActive={isAllePromptsActive}
            onClick={() => {
              onSelectCategory("Alle prompts");
              onClose();
            }}
            count={prompts ? prompts.length : 0}
            bold
          />

          <div
            style={{
              height: "1px",
              backgroundColor: "rgba(255,255,255,0.1)",
              margin: "6px 0",
            }}
          />

          {/* Secties — merged dropdown with categories per section */}
          {hoofdcategorieën && hoofdcategorieën.length > 0 && (
            <MobileDropdownSection
              icon={<Layers size={14} style={{ opacity: 0.6 }} />}
              title="Secties"
              isOpen={sectiesOpen}
              onToggle={() => setSectiesOpen(!sectiesOpen)}
            >
              {hoofdcategorieën.map((hc) => {
                const hcPrompts = prompts.filter((p) =>
                  hc.sections.some((s) => p.section.includes(s)),
                );
                const sectionPromptCount = hcPrompts.length;
                const isSectionActive = selectedSection === hc.name;
                const isExpanded = expandedSections[hc.name] !== false;
                const catsForSection = hcCategories[hc.name] || [];

                return (
                  <div key={hc.name}>
                    {/* Section header */}
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
                        onClick={() => {
                          onSelectSection(hc.name);
                          onClose();
                        }}
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
                          {sectionPromptCount}
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
                          const promptCount = prompts
                            ? prompts.filter(
                                (p) =>
                                  hc.sections.some((s) =>
                                    p.section.includes(s),
                                  ) && p.categories.includes(cat),
                              ).length
                            : 0;
                          return (
                            <MobileSidebarButton
                              key={cat}
                              label={cat}
                              isActive={isActive}
                              onClick={() => {
                                onSelectCategory(cat);
                                onClose();
                              }}
                              count={promptCount}
                              indent
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </MobileDropdownSection>
          )}

          {/* Specifiek voor chatbot dropdown */}
          {chatbotModels && chatbotModels.length > 0 && (
            <MobileDropdownSection
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
                  <MobileSidebarButton
                    key={model}
                    label={model}
                    isActive={isActive}
                    onClick={() => {
                      onSelectChatbot(isActive ? null : model);
                      onClose();
                    }}
                    count={promptCount}
                    indent
                  />
                );
              })}
            </MobileDropdownSection>
          )}
        </div>
      </aside>
    </>
  );
}

function MobileDropdownSection({ icon, title, isOpen, onToggle, children }) {
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

function MobileSidebarButton({
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
    >
      <span
        className="flex items-center gap-2"
        style={{ flex: 1, minWidth: 0 }}
      >
        {icon}
        <span style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
          {label}
        </span>
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
