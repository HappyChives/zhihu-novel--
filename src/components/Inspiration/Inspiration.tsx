import { useState, useEffect } from "react";
import { useApp } from "../../lib/context";
import { buildInspirationPrompt } from "../../prompts";
import { InspirationCard } from "../ui/InspirationCard";
import type { InspirationItem } from "../../lib/types";

const MOOD_OPTIONS = ["虐", "甜", "爽", "悬疑", "搞笑", "治愈"];
const GENRE_OPTIONS = ["现代言情", "古代言情", "悬疑推理", "都市职场", "校园", "玄幻奇幻", "不限"];

export function Inspiration() {
  const { config, project, setInspirations, setRawInspirations, selectInspiration } = useApp();

  const [genre, setGenre] = useState(project?.hotspotData ? "" : "不限");
  const [mood, setMood] = useState("爽");
  const [protagonistPrefs, setProtagonistPrefs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspirations, setLocalInspirations] = useState<InspirationItem[]>(
    project?.inspirations || []
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(
    project?.selectedInspirationId
  );
  const [rawResult, setRawResult] = useState(project?.rawInspirations || "");

  // 组件挂载时同步 project 中的数据（切换页面后恢复）
  useEffect(() => {
    if (project?.inspirations?.length) {
      setLocalInspirations(project.inspirations);
    }
    if (project?.selectedInspirationId) {
      setSelectedId(project.selectedInspirationId);
    }
    if (project?.rawInspirations) {
      setRawResult(project.rawInspirations);
    }
  }, [project?.id]);

  const handleGenerate = async () => {
    const { system, user } = buildInspirationPrompt({
      hotspotData: project?.hotspotData,
      genre: genre && genre !== "不限" ? genre : undefined,
      mood,
      protagonistPrefs: protagonistPrefs || undefined,
    });
    setLoading(true);
    setError(null);
    setInspirations([]);
    setLocalInspirations([]);
    setSelectedId(undefined);

    try {
      let full = "";
      for await (const chunk of (await import("../../lib/llm")).streamLLM(
        config.llm, system, user
      )) {
        full += chunk;
        // 实时保存中间结果，切换页面也不会丢
        setRawInspirations(full);
      }
      setRawResult(full);
      setRawInspirations(full);

      // Parse inspirations from result (simple markdown list parsing)
      const parsed = parseInspirations(full);
      setLocalInspirations(parsed);
      setInspirations(parsed);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  function parseInspirations(text: string): InspirationItem[] {
    // Simple parsing: split by numbered list items or markdown headers
    const items: InspirationItem[] = [];
    const blocks = text.split(/(?:^|\n)(?=#+\s*|\d+[.)]\s*【)/m);

    let idx = 0;
    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed || trimmed.length < 20) continue;

      // Extract title from first line
      const lines = trimmed.split("\n");
      const title = lines[0].replace(/^#+\s*/, "").replace(/^\d+[.)]\s*/, "").trim() || `灵感 ${idx + 1}`;

      const content = lines.slice(1).join("\n");

      items.push({
        id: `insp-${Date.now()}-${idx}`,
        title,
        conflict: extractField(content, "核心冲突") || content.slice(0, 100),
        characters: extractField(content, "人物") || extractField(content, "人物设定") || "",
        worldSetting: extractField(content, "世界观") || extractField(content, "背景") || "",
        mood: extractField(content, "情绪") || mood,
        explosionPoint: extractField(content, "爆点") || "",
        genre: extractField(content, "题材") || genre || "不限",
      });
      idx++;
    }

    return items.slice(0, 5);
  }

  function extractField(text: string, field: string): string {
    const match = text.match(new RegExp(`【?${field}】?:?\\s*([^\\n【】]+)`, "i"));
    return match ? match[1].trim() : "";
  }

  const handleSelect = (id: string) => {
    setSelectedId(id);
    selectInspiration(id);
  };

  const selectedInspiration = inspirations.find((i) => i.id === selectedId);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">💡 灵感生成</h2>
        <p className="text-gray-400 text-sm">
          基于热点分析，生成 3-5 个有爆款潜力的详细灵感碎片
        </p>
      </div>

      {project?.hotspotData && (
        <div className="card mb-4 border-primary-500/20">
          <p className="text-xs text-gray-500 mb-1">基于热点分析</p>
          <p className="text-gray-300 text-sm line-clamp-2">{project?.hotspotData?.slice(0, 200)}...</p>
        </div>
      )}

      <div className="card mb-4 space-y-4">
        {/* 题材 */}
        <div>
          <p className="section-title">题材类型</p>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  genre === g ? "bg-primary-600 text-white" : "bg-dark-card text-gray-400"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 情绪 */}
        <div>
          <p className="section-title">期望情绪</p>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  mood === m ? "bg-primary-600 text-white" : "bg-dark-card text-gray-400"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* 主角偏好 */}
        <div>
          <p className="section-title">主角设定偏好（可选）</p>
          <input
            className="input-field"
            placeholder="例如：女主是医生，男主是消防员..."
            value={protagonistPrefs}
            onChange={(e) => setProtagonistPrefs(e.target.value)}
          />
        </div>

        <button
          className="btn-primary w-full"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "生成中..." : "生成灵感"}
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      {inspirations.length > 0 && (
        <div className="space-y-3">
          <p className="section-title">生成的灵感（点击选用）</p>
          {inspirations.map((item) => (
            <InspirationCard
              key={item.id}
              item={item}
              rawText={rawResult}
              isSelected={item.id === selectedId}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {rawResult && inspirations.length === 0 && !loading && (
        <div className="card">
          <p className="section-title">生成结果（解析失败，请复制使用）</p>
          <pre className="whitespace-pre-wrap text-sm text-gray-300">{rawResult}</pre>
        </div>
      )}
    </div>
  );
}
