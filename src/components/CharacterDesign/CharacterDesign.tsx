import { useState } from "react";
import { useApp } from "../../lib/context";
import { buildCharacterPrompt } from "../../prompts";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import { CharacterCard } from "../ui/CharacterCard";
import type { Character } from "../../lib/types";

function generateId() {
  return `char-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyCharacter(): Character {
  return {
    id: generateId(),
    name: "",
    role: "protagonist",
    coreDesire: "",
    coreFear: "",
    rootConflict: "",
    backstory: "",
    keyTrait: "",
    arc: "",
  };
}

export function CharacterDesign() {
  const { config, project, setCharacters } = useApp();

  // Guard: no project loaded yet
  if (!project) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">人物设计</h2>
        </div>
        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 text-center">加载中...</p>
        </div>
      </div>
    );
  }

  const [characters, setLocalCharacters] = useState<Character[]>(
    project.characters?.length ? project.characters : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayResult, setDisplayResult] = useState("");
  const [saved, setSaved] = useState(!!project.characters?.length);

  const selectedInspiration = project.inspirations.find(
    (i) => i.id === project.selectedInspirationId
  );

  const canGenerate = !!(selectedInspiration && project.worldSetting);

  const handleGenerate = async () => {
    if (!canGenerate) return;

    const { system, user } = buildCharacterPrompt({
      inspiration: {
        title: selectedInspiration.title,
        conflict: selectedInspiration.conflict,
        characters: selectedInspiration.characters,
        mood: selectedInspiration.mood,
      },
      worldSetting: project.worldSetting,
      outline: project.outline?.mainLine,
    });

    setDisplayResult("");
    setLoading(true);
    setError(null);

    try {
      let full = "";
      for await (const chunk of (await import("../../lib/llm")).streamLLM(
        config.llm, system, user
      )) {
        full += chunk;
        setDisplayResult(full);
      }
      // Parse characters from text - simple approach: create default characters from result
      const chars = parseCharacters(full);
      setLocalCharacters(chars);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  function parseCharacters(text: string): Character[] {
    // Extract character blocks (split by numbered list or markdown headers)
    const chars: Character[] = [];
    const blocks = text.split(/(?:^|\n)(?=#+\s*|\d+[.)]\s*【)/m);
    let idx = 0;
    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed || trimmed.length < 30) continue;
      const lines = trimmed.split("\n");
      const name = lines[0].replace(/^#+\s*/, "").replace(/^\d+[.)]\s*/, "").trim() || `角色 ${idx + 1}`;
      const content = lines.slice(1).join("\n");
      chars.push({
        id: generateId(),
        name,
        role: idx === 0 ? "protagonist" : idx === 1 ? "antagonist" : "supporting",
        coreDesire: extractField(content, "核心渴望") || extractField(content, "渴望"),
        coreFear: extractField(content, "核心恐惧") || extractField(content, "恐惧"),
        rootConflict: extractField(content, "根冲突") || "",
        backstory: extractField(content, "背景") || "",
        keyTrait: extractField(content, "标志性") || "",
        arc: extractField(content, "弧光") || "",
      });
      idx++;
    }
    return chars.slice(0, 5);
  }

  function extractField(text: string, field: string): string {
    const match = text.match(new RegExp(`【?${field}】?:?\\s*([^\\n【】]+)`, "i"));
    return match ? match[1].trim() : "";
  }

  const handleAddCharacter = () => {
    setLocalCharacters((prev) => [...prev, emptyCharacter()]);
    setSaved(false);
  };

  const handleRemoveCharacter = (id: string) => {
    setLocalCharacters((prev) => prev.filter((c) => c.id !== id));
    setSaved(false);
  };

  const handleUpdateCharacter = (updated: Character) => {
    setLocalCharacters((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    setSaved(false);
  };

  const handleConfirm = () => {
    if (characters.length === 0) return;
    setCharacters(characters.filter((c) => c.name.trim()));
    setSaved(true);
  };

  if (!selectedInspiration || !project.worldSetting) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">人物设计</h2>
        </div>
        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 text-center">
            请先完成「灵感生成」和「世界观设定」，再进入人物设计
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">人物设计</h2>
        <p className="text-gray-400 text-sm">
          基于故事大纲，设计 3-5 个主要人物（六要素：渴望/恐惧/根冲突/背景/标志细节/弧光）
        </p>
      </div>

      {canGenerate && characters.length === 0 && !displayResult && (
        <button className="btn-primary w-full mb-4" onClick={handleGenerate} disabled={loading}>
          {loading ? "生成中..." : "✨ AI 生成人物设定"}
        </button>
      )}

      {displayResult && characters.length === 0 && !loading && (
        <div className="card mb-4">
          <p className="section-title">AI 生成预览</p>
          <MarkdownRenderer content={displayResult} />
          <p className="text-gray-500 text-sm mt-2">无法解析人物数据，请手动添加人物</p>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="space-y-4 mb-4">
        {characters.map((char) => (
          <CharacterCard
            key={char.id}
            character={char}
            onChange={handleUpdateCharacter}
            onRemove={characters.length > 1 ? () => handleRemoveCharacter(char.id) : undefined}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={handleAddCharacter}>
          + 添加人物
        </button>
        <button
          className="btn-primary flex-1"
          onClick={handleConfirm}
          disabled={characters.length === 0}
        >
          {saved ? "✓ 人物已确认 ✓" : "确认人物，进入章节细纲 →"}
        </button>
      </div>
    </div>
  );
}
