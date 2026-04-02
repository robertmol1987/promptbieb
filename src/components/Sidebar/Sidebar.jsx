import { Loader2, AlertCircle } from "lucide-react";
import { SidebarItem } from "./SidebarItem";

export function Sidebar({
  tree,
  selectedId,
  onSelect,
  isLoading,
  error,
  expandedIds,
  onToggleExpanded,
}) {
  return (
    <aside
      className="hidden md:flex flex-col w-[360px] flex-shrink-0"
      style={{
        backgroundColor: "#1d4a3c",
        borderRight: "4px solid rgba(255,255,255,0.1)",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div className="p-6 pt-4">
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
  );
}
