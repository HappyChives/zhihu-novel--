import { useState } from "react";
import type { InspirationItem } from "../../lib/types";

interface Props {
  item: InspirationItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function InspirationCard({ item, isSelected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`card cursor-pointer transition-all ${
        isSelected
          ? "border-primary-500 ring-1 ring-primary-500/50"
          : "border-dark-border hover:border-primary-400/50"
      }`}
      onClick={() => onSelect(item.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-semibold text-base">{item.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-dark-card px-2 py-0.5 rounded text-gray-400">{item.genre}</span>
          <span className="text-xs bg-primary-500/20 px-2 py-0.5 rounded text-primary-300">{item.mood}</span>
        </div>
      </div>

      <p className="text-gray-300 text-sm mb-2">
        <span className="text-gray-500">核心冲突：</span>{item.conflict}
      </p>

      <p className="text-gray-300 text-sm mb-2">
        <span className="text-gray-500">人物：</span>{item.characters}
      </p>

      <button
        className="text-xs text-gray-500 hover:text-gray-300 mt-1"
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
      >
        {expanded ? "收起详情 ▲" : "展开详情 ▼"}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-dark-border space-y-2">
          <p className="text-gray-300 text-sm">
            <span className="text-gray-500">世界观：</span>{item.worldSetting}
          </p>
          <p className="text-gray-300 text-sm">
            <span className="text-yellow-400">爆点：</span>{item.explosionPoint}
          </p>
        </div>
      )}

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-primary-500/30">
          <span className="text-primary-400 text-sm font-medium">✓ 已选用此灵感</span>
        </div>
      )}
    </div>
  );
}
