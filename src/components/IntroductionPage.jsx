import { BookContent } from "./Content/BookContent";

export function IntroductionPage({ section, images }) {
  if (!section) return null;

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="p-8 pt-6 page-fade" style={{ maxWidth: "800px" }}>
        <BookContent section={section} images={images} />
      </div>
    </div>
  );
}
