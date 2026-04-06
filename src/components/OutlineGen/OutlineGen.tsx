import { useState, useEffect } from "react";
import { useApp } from "../../lib/context";
import { buildOutlinePrompt } from "../../prompts";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";

export function OutlineGen() {
  const { config, project, setOutline } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayResult, setDisplayResult] = useState("");
  const [rawResult, setRawResult] = useState("");
  const [saved, setSaved] = useState(!!project?.outline);

  // 挂载时恢复已有数据
  useEffect(() => {
    if (project?.outline) {
      setRawResult(project.outline.mainLine);
      setDisplayResult(project.outline.mainLine);
      setSaved(true);
    }
  }, [project?.id]);

  const selectedInspiration = project?.inspirations?.find(
    (i) => i.id === project?.selectedInspirationId
  );

  const canGenerate = !!(selectedInspiration && project?.worldSetting);

  const handleGenerate = async () => {
    if (!canGenerate || !selectedInspiration) return;

    const { system, user } = buildOutlinePrompt({
      inspiration: {
        title: selectedInspiration.title,
        conflict: selectedInspiration.conflict,
        characters: selectedInspiration.characters,
        mood: selectedInspiration.mood,
        explosionPoint: selectedInspiration.explosionPoint,
      },
      worldSetting: project.worldSetting,
      hotspotData: project.hotspotData,
    });

    setResult("");
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
        // 实时保存中间结果
        setOutline({
          hook: full.slice(0, 300),
          mainLine: full,
          explosionPoints: [],
          ending: "",
          chapterWordAlloc: Array.from({ length: 10 }, () => 900),
        });
      }
      setResult(full);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  function setResult(v: string) { setRawResult(v); }

  const handleConfirm = () => {
    setOutline({
      hook: rawResult.slice(0, 300),
      mainLine: rawResult,
      explosionPoints: [],
      ending: "",
      chapterWordAlloc: Array.from({ length: 10 }, () => 900),
    });
    setSaved(true);
  };

  if (!selectedInspiration) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">🗺️ 故事大纲</h2>
        </div>
        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 text-center">
            请先在「灵感生成」页面选定灵感，再进入大纲设计
          </p>
        </div>
      </div>
    );
  }

  if (!project?.worldSetting) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">🗺️ 故事大纲</h2>
        </div>
        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 text-center">
            请先完成「世界观设定」，再进入大纲设计
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">🗺️ 故事大纲</h2>
        <p className="text-gray-400 text-sm">
          基于灵感和世界观，生成完整的四幕结构大纲（10章，8500-10000字）
        </p>
      </div>

      <div className="card mb-4 border-primary-500/20">
        <p className="text-xs text-gray-500 mb-1">选定灵感</p>
        <p className="text-white font-medium">{selectedInspiration.title}</p>
        <p className="text-xs text-gray-400 mt-1">世界观：{project.worldSetting?.baseRule?.slice(0, 50)}...</p>
      </div>

      {canGenerate && !rawResult && (
        <button
          className="btn-primary w-full mb-4"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "生成中..." : "✨ 生成故事大纲"}
        </button>
      )}

      {displayResult && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">大纲内容</p>
            <button
              className="btn-secondary text-xs"
              onClick={() => navigator.clipboard.writeText(rawResult)}
            >
              复制
            </button>
          </div>
          <MarkdownRenderer content={displayResult} />
        </div>
      )}

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button
        className="btn-primary w-full"
        onClick={handleConfirm}
        disabled={!rawResult}
      >
        {saved ? "✓ 大纲已确认 ✓" : "确认大纲，进入人物设计 →"}
      </button>
    </div>
  );
}
