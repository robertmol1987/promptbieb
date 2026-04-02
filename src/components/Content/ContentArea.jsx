import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { BookContent } from "./BookContent";
import { BookViewContent } from "./BookViewContent";

export function ContentArea({
  selectedSection,
  sections,
  images,
  isLoading,
  error,
  sectionIndex,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  viewMode,
  onVisibleSectionChange,
}) {
  return (
    <main
      className="flex-1 overflow-hidden flex font-work-sans"
      style={{
        backgroundColor: "#FFFFFF",
        height: "calc(100vh - 100px)",
      }}
    >
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 size={36} color="#152A4A" className="loader-spin" />
          <p className="text-base" style={{ color: "#555" }}>
            Document wordt geladen…
          </p>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <AlertCircle size={36} color="#DC2626" />
          <p className="text-base" style={{ color: "#DC2626" }}>
            Het document kon niet worden geladen.
          </p>
          <p className="text-sm" style={{ color: "#666" }}>
            Controleer de verbinding en probeer het opnieuw.
          </p>
        </div>
      )}

      {/* Book mode: all sections stacked */}
      {viewMode === "boek" && !isLoading && !error && sections && (
        <BookViewContent
          sections={sections}
          images={images}
          onVisibleSectionChange={onVisibleSectionChange}
        />
      )}

      {/* Wiki mode: single section */}
      {viewMode === "wiki" && selectedSection && (
        <div
          className="page-fade flex-1 overflow-y-auto p-8 pt-12"
          style={{
            backgroundColor: "#FFFFFF",
          }}
        >
          <div style={{ maxWidth: "60%", width: "100%" }}>
            <BookContent section={selectedSection} images={images} />
          </div>

          {/* Navigation buttons */}
          <div
            className="flex items-center justify-between gap-4 mt-8 mb-4"
            style={{ maxWidth: "60%" }}
          >
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: hasPrevious ? "#152A4A" : "#E5E7EB",
                color: hasPrevious ? "#FFFFFF" : "#9CA3AF",
                cursor: hasPrevious ? "pointer" : "not-allowed",
                opacity: hasPrevious ? 1 : 0.5,
              }}
            >
              <ChevronLeft size={20} />
              <span className="font-medium">Vorige</span>
            </button>

            <button
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{
                backgroundColor: hasNext ? "#152A4A" : "#E5E7EB",
                color: hasNext ? "#FFFFFF" : "#9CA3AF",
                cursor: hasNext ? "pointer" : "not-allowed",
                opacity: hasNext ? 1 : 0.5,
              }}
            >
              <span className="font-medium">Volgende</span>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Page number */}
          <div
            className="text-center py-3 text-xs"
            style={{ color: "rgba(0,0,0,0.25)", maxWidth: "60%" }}
          >
            {sectionIndex}
          </div>
        </div>
      )}
    </main>
  );
}
