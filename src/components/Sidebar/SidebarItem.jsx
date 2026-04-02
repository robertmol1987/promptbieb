import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { LETTERS, GREEK } from "@/utils/labelHelpers";

export function SidebarItem({
  item,
  selectedId,
  onSelect,
  depth = 0,
  index = 0,
  expandedIds,
  onToggleExpanded,
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedId === item.id;
  const isExpanded = expandedIds.has(item.id);

  const isTopLevel = item.level === 1;
  const isSecondLevel = item.level === 2;

  // Label text: 1. for top, A) for second, α for third+
  let label;
  if (isTopLevel) {
    label = `${index + 1}.`;
  } else if (isSecondLevel) {
    label = `${LETTERS[index % 26]})`;
  } else {
    label = GREEK[index % GREEK.length];
  }

  const verticalPad = isTopLevel ? "8px" : "6px";
  const topMargin = isTopLevel && index > 0 ? "6px" : "0px";

  // Selected state: amber/gold left bar + subtle highlight
  const bgColor = isSelected ? "rgba(255,255,255,0.10)" : "transparent";
  const textColor = isSelected ? "#FFFFFF" : "rgba(255,255,255,0.8)";
  const leftBorder = isSelected ? "3px solid #D4A843" : "3px solid transparent";

  // Badge colors
  const badgeBg = isSelected ? "#D4A843" : "rgba(210,180,120,0.25)";
  const badgeText = isSelected ? "#1A1A1A" : "rgba(255,255,255,0.85)";

  const handleItemClick = () => {
    if (isSelected && hasChildren) {
      // Already selected with children: toggle expand/collapse
      onToggleExpanded(item.id);
    } else {
      // Not selected: select it
      onSelect(item.id);
      // Auto-expand if it has children and not already expanded
      if (hasChildren && !isExpanded) {
        onToggleExpanded(item.id);
      }
    }
  };

  const handleChevronClick = (e) => {
    e.stopPropagation(); // Prevent item selection
    onToggleExpanded(item.id);
  };

  return (
    <div>
      <button
        onClick={handleItemClick}
        className="w-full text-left flex items-center gap-2.5 transition-all duration-150"
        style={{
          marginLeft: `${depth * 20}px`,
          paddingLeft: "10px",
          paddingTop: verticalPad,
          paddingBottom: verticalPad,
          paddingRight: "12px",
          backgroundColor: bgColor,
          color: textColor,
          marginTop: topMargin,
          borderLeft: leftBorder,
          borderRadius: "0px",
        }}
        onMouseEnter={(e) => {
          if (!isSelected)
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          if (!isSelected)
            e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {hasChildren ? (
          <button
            onClick={handleChevronClick}
            className="flex-shrink-0"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            {isExpanded ? (
              <ChevronDown size={12} style={{ opacity: 0.5 }} />
            ) : (
              <ChevronRight size={12} style={{ opacity: 0.5 }} />
            )}
          </button>
        ) : (
          <span className="w-[12px] flex-shrink-0" />
        )}

        {/* Badge / pill for the label */}
        <span
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            fontSize: "12px",
            fontWeight: 600,
            backgroundColor: badgeBg,
            color: badgeText,
            borderRadius: "6px",
            minWidth: "28px",
            height: "22px",
            paddingLeft: "6px",
            paddingRight: "6px",
            lineHeight: 1,
          }}
        >
          {label}
        </span>

        <span
          style={{
            fontWeight: 400,
            fontSize: "16px",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            flex: 1,
          }}
        >
          {item.title}
        </span>
      </button>

      {hasChildren && isExpanded && (
        <div>
          {item.children.map((child, childIdx) => (
            <SidebarItem
              key={child.id}
              item={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
              index={childIdx}
              expandedIds={expandedIds}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
