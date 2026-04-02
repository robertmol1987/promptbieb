import { useEffect, useRef, useCallback } from "react";
import { BookContent } from "./BookContent";

export function BookViewContent({ sections, images, onVisibleSectionChange }) {
  const containerRef = useRef(null);
  const sectionRefs = useRef({});

  const registerRef = useCallback((id, el) => {
    if (el) {
      sectionRefs.current[id] = el;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !sections || sections.length === 0) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top;
      let closestId = null;
      let closestDistance = Infinity;

      for (const section of sections) {
        const el = sectionRefs.current[section.id];
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - containerTop - 60);

        if (rect.top <= containerTop + 150 && distance < closestDistance) {
          closestDistance = distance;
          closestId = section.id;
        }
      }

      // If nothing is above the fold yet, pick the first section
      if (!closestId && sections.length > 0) {
        closestId = sections[0].id;
      }

      if (closestId) {
        onVisibleSectionChange(closestId);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [sections, onVisibleSectionChange]);

  if (!sections || sections.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-8 pt-12"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div style={{ maxWidth: "60%", width: "100%" }}>
        {sections.map((section) => (
          <div
            key={section.id}
            ref={(el) => registerRef(section.id, el)}
            style={{ marginBottom: "48px" }}
          >
            <BookContent section={section} images={images} />
          </div>
        ))}
      </div>
    </div>
  );
}
