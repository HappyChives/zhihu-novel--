import { useState } from "react";
import type { InspirationItem } from "../../lib/types";

interface Props {
  item: InspirationItem;
  /** 原始未解析文本，当结构化字段为空时显示 */
  rawText?: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function InspirationCard({ item, rawText, isSelected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(true); // 默认展开

  const hasStructuredContent = item.conflict || item.explosionPoint;
  const displayText = rawText?.trim();

  return (
    <div
      className={`card cursor-pointer transition-all ${
        isSelected
          ? "border-primary-500 ring-1 ring-primary-500/50"
          : "border-dark-border hover:border-primary-400/50"
      }`}
      onClick={() => onSelect(item.id)}
    >
      {/* 标题行 */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-white font-semibold text-base flex-1 pr-2">{item.title || "未命名灵感"}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs bg-dark-card px-2 py-0.5 rounded text-gray-400">{item.genre || "不限"}</span>
          <span className="text-xs bg-primary-500/20 px-2 py-0.5 rounded text-primary-300">{item.mood || "爽"}</span>
        </div>
      </div>

      {/* 结构化内容 */}
      {hasStructuredContent && (
        <div className="space-y-2 mb-3">
          {item.conflict && (
            <p className="text-gray-300 text-sm">
              <span className="text-primary-400 font-medium">核心冲突：</span>{item.conflict}
            </p>
          )}
          {item.characters && (
            <p className="text-gray-300 text-sm">
              <span className="text-blue-400 font-medium">人物：</span>{item.characters}
            </p>
          )}
          {item.worldSetting && (
            <p className="text-gray-300 text-sm">
              <span className="text-purple-400 font-medium">世界观：</span>{item.worldSetting}
            </p>
          )}
          {item.explosionPoint && (
            <p className="text-gray-200 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <span className="text-yellow-400 font-bold">💥 爆点分析：</span>{item.explosionPoint}
            </p>
          )}
        </div>
      )}

      {/* 原始文本（当结构化解析失败时） */}
      {!hasStructuredContent && displayText && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">（以下为 AI 生成原文）</p>
          <p className="text-gray-300 text-sm whitespace-pre-wrap">{displayText.slice(0, 500)}{displayText.length > 500 ? "..." : ""}</p>
        </div>
      )}

      {/* 展开/收起 */}
      <div className="flex items-center justify-between pt-2 border-t border-dark-border">
        <button
          className="text-xs text-gray-500 hover:text-gray-300"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          {expanded ? "收起 ▲" : "展开详情 ▼"}
        </button>
        {isSelected && (
          <span className="text-primary-400 text-xs font-medium">✓ 已选用</span>
        )}
      </div>

      {/* 展开内容：原始完整文本 */}
      {expanded && displayText && displayText.length > 500 && (
        <div className="mt-3 pt-3 border-t border-dark-border">
          <p className="text-xs text-gray-500 mb-1">完整内容</p>
          <p className="text-gray-300 text-sm whitespace-pre-wrap">{displayText}</p>
        </div>
      )}
    </div>
  );
}
