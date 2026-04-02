import { SidebarItem } from "./SidebarItem";

export function MobileSidebar({
  tree,
  selectedId,
  onSelect,
  isOpen,
  onClose,
  expandedIds,
  onToggleExpanded,
}) {
  if (!isOpen) return null;

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
        <div className="p-6 pt-4">
          {tree.map((item, idx) => (
            <SidebarItem
              key={item.id}
              item={item}
              selectedId={selectedId}
              onSelect={onSelect}
              index={idx}
              expandedIds={expandedIds}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
