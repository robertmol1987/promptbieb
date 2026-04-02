import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAndParseDocx } from "@/utils/docx/docxParser";
import { parsePromptLibrary } from "@/utils/docx/promptParser";
import { Header } from "@/components/Header/Header";
import { ChatbotBar } from "@/components/ChatbotBar";
import { CategorySidebar } from "@/components/CategorySidebar";
import { MobileCategorySidebar } from "@/components/MobileCategorySidebar";
import { PromptList } from "@/components/PromptList";
import { IntroductionPage } from "@/components/IntroductionPage";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Alle prompts");
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedChatbot, setSelectedChatbot] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showAuthor, setShowAuthor] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [filterFavoriet, setFilterFavoriet] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["docx-content"],
    queryFn: fetchAndParseDocx,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const sections = data?.sections;
  const images = data?.images || {};
  const auteurSections = data?.auteurSections;
  const auteurImages = data?.auteurImages || {};

  // Merge images from both documents
  const allImages = useMemo(() => {
    return { ...images, ...auteurImages };
  }, [images, auteurImages]);

  // Parse the prompt library from the raw sections
  const library = useMemo(() => {
    if (!sections) return null;
    return parsePromptLibrary(sections, auteurSections, auteurImages);
  }, [sections, auteurSections, auteurImages]);

  // Build a lookup from hoofdcategorie name to its section values
  const hcSectionMap = useMemo(() => {
    if (!library?.hoofdcategorieën) return {};
    const map = {};
    for (const hc of library.hoofdcategorieën) {
      map[hc.name] = hc.sections;
    }
    return map;
  }, [library]);

  // Get filtered prompts based on selected category, section, and chatbot
  const filteredPrompts = useMemo(() => {
    if (!library) return [];
    let result = library.prompts;

    if (selectedSection) {
      // selectedSection is a hoofdcategorie name — look up actual section values
      const sectionValues = hcSectionMap[selectedSection];
      if (sectionValues && sectionValues.length > 0) {
        result = result.filter((p) =>
          sectionValues.some((s) => p.section.includes(s)),
        );
      } else {
        // Fallback: try direct match (backward compat)
        result = result.filter((p) => p.section.includes(selectedSection));
      }
    } else if (selectedCategory && selectedCategory !== "Alle prompts") {
      result = result.filter((p) => p.categories.includes(selectedCategory));
    }

    // Apply chatbot filter on top
    if (selectedChatbot) {
      result = result.filter((p) => p.taalmodel === selectedChatbot);
    }

    // Sort alphabetically by name
    return result.sort((a, b) => a.name.localeCompare(b.name, "nl"));
  }, [
    library,
    selectedCategory,
    selectedSection,
    selectedChatbot,
    hcSectionMap,
  ]);

  // Author links parsed from [Ook van deze auteur] section in the Word doc
  const authorLinks = library?.authorLinks || [];

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedSection(null);
    setShowIntro(false);
    setShowAuthor(false);
    setShowTraining(false);
    setSidebarOpen(false);
  };

  const handleSelectSection = (sectionName) => {
    setSelectedSection(sectionName);
    setSelectedCategory(null);
    setShowIntro(false);
    setShowAuthor(false);
    setShowTraining(false);
    setSidebarOpen(false);
  };

  const handleSelectChatbot = (model) => {
    setSelectedChatbot(model);
    setSelectedSection(null);
    setSelectedCategory("Alle prompts");
    setShowIntro(false);
    setShowAuthor(false);
    setShowTraining(false);
  };

  const handleShowIntro = () => {
    setShowIntro(true);
    setShowAuthor(false);
    setShowTraining(false);
    setSelectedCategory(null);
    setSelectedSection(null);
  };

  const handleShowAuthor = () => {
    setShowAuthor(true);
    setShowIntro(false);
    setShowTraining(false);
    setSelectedCategory(null);
    setSelectedSection(null);
    setSidebarOpen(false);
  };

  const handleShowTraining = () => {
    setShowTraining(true);
    setShowIntro(false);
    setShowAuthor(false);
    setSelectedCategory(null);
    setSelectedSection(null);
    setSidebarOpen(false);
  };

  const handleToggleFavoriet = () => {
    setFilterFavoriet((prev) => {
      const next = !prev;
      if (next) {
        // When enabling the filter, navigate to "Alle prompts"
        setShowIntro(false);
        setShowAuthor(false);
        setShowTraining(false);
        setSelectedSection(null);
        setSelectedCategory("Alle prompts");
      }
      return next;
    });
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#1d4a3c",
        fontFamily: "Work Sans, sans-serif",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .page-fade { animation: fadeIn 300ms ease-out; }
        .sidebar-slide { animation: slideIn 250ms ease-out; }
        .loader-spin { animation: spin 1s linear infinite; }
      ` }} />

      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        paginaTitel={library?.paginaTitel || []}
        paginaSubtitel={library?.paginaSubtitel || []}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <CategorySidebar
          categories={library?.allCategories || []}
          sectionOrder={library?.sectionOrder || []}
          chatbotModels={library?.allChatbotModels || []}
          prompts={library?.prompts || []}
          selectedCategory={selectedCategory}
          selectedSection={selectedSection}
          selectedChatbot={selectedChatbot}
          onSelectCategory={handleSelectCategory}
          onSelectSection={handleSelectSection}
          onSelectChatbot={handleSelectChatbot}
          isLoading={isLoading}
          error={error}
          showIntro={showIntro}
          onShowIntro={handleShowIntro}
          showAuthor={showAuthor}
          onShowAuthor={handleShowAuthor}
          hasAuthor={!!library?.overDeAuteur}
          authorLinks={authorLinks}
          hoofdcategorieën={library?.hoofdcategorieën || []}
          hasTraining={!!library?.training}
          showTraining={showTraining}
          onShowTraining={handleShowTraining}
        />

        <MobileCategorySidebar
          categories={library?.allCategories || []}
          sectionOrder={library?.sectionOrder || []}
          chatbotModels={library?.allChatbotModels || []}
          prompts={library?.prompts || []}
          selectedCategory={selectedCategory}
          selectedSection={selectedSection}
          selectedChatbot={selectedChatbot}
          onSelectCategory={handleSelectCategory}
          onSelectSection={handleSelectSection}
          onSelectChatbot={handleSelectChatbot}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          showIntro={showIntro}
          onShowIntro={handleShowIntro}
          showAuthor={showAuthor}
          onShowAuthor={handleShowAuthor}
          hasAuthor={!!library?.overDeAuteur}
          authorLinks={authorLinks}
          hoofdcategorieën={library?.hoofdcategorieën || []}
          hasTraining={!!library?.training}
          showTraining={showTraining}
          onShowTraining={handleShowTraining}
        />

        {/* Right column: chatbot bar + content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatbotBar
            chatbots={library?.chatbots || []}
            filterFavoriet={filterFavoriet}
            onToggleFavoriet={handleToggleFavoriet}
          />

          {showIntro ? (
            <IntroductionPage
              section={library?.introduction}
              images={allImages}
            />
          ) : showAuthor ? (
            <IntroductionPage
              section={library?.overDeAuteur}
              images={allImages}
            />
          ) : showTraining ? (
            <IntroductionPage section={library?.training} images={allImages} />
          ) : (
            <PromptList
              prompts={filteredPrompts}
              categoryTitle={selectedCategory}
              sectionTitle={selectedSection}
              filterFavoriet={filterFavoriet}
              hoofdcategorieën={library?.hoofdcategorieën || []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
