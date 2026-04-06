import { useState } from "react";
import { useApp } from "../../lib/context";
import { buildChapterOutlinePrompt } from "../../prompts";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";

export function ChapterOutline() {
  const { config, project, setChapterOutline } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayResult, setDisplayResult] = useState("");
  const [rawResult, setRawResult] = useState("");
  const [saved, setSaved] = useState(!!project?.chapterOutline);

  if (!project) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">📖 章节细纲</h2>
        </div>
        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 text-center">请先创建或加载项目</p>
        </div>
      </div>
    );
  }

  const canGenerate = !!(project.outline && project.characters?.length);

  const handleGenerate = async () => {
    if (!canGenerate) return;

    const { system, user } = buildChapterOutlinePrompt({
      outline: project.outline?.mainLine || "",
      characters: project.characters?.map((c) => ({
        name: c.name,
        role: c.role,
        coreDesire: c.coreDesire,
        coreFear: c.coreFear,
        rootConflict: c.rootConflict,
      })),
      worldSetting: project.worldSetting?.baseRule,
      totalWords: 9000,
    });

    setRawResult("");
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
      setRawResult(full);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setChapterOutline({
      totalChapters: 10 as const,
      totalWords: rawResult.length * 10, // rough estimate
      chapters: [],
    });
    setSaved(true);
  };

  if (!project.outline) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">📖 章节细纲</h2>
        </div>
        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 text-center">
            请先完成「故事大纲」，再进入章节细纲设计
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">📖 章节细纲</h2>
        <p className="text-gray-400 text-sm">
          将故事大纲展开为 10 章章节细纲，每章 3-5 小节，总字数 8500-10000
        </p>
      </div>

      <div className="card mb-4">
        <p className="section-title">字数目标</p>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-400">目标总字数：<span className="text-white">8500 - 10000</span></span>
          <span className="text-gray-400">每章：<span className="text-white">850-1000 字</span></span>
          <span className="text-gray-400">每小节：<span className="text-white">200-300 字</span></span>
        </div>
      </div>

      {canGenerate && !rawResult && (
        <button
          className="btn-primary w-full mb-4"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "生成中..." : "✨ 生成章节细纲"}
        </button>
      )}

      {displayResult && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">章节细纲内容</p>
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

      <div className="space-y-3">
        <button
          className="btn-primary w-full"
          onClick={handleConfirm}
          disabled={!rawResult}
        >
          {saved ? "✓ 章节细纲已确认 ✓" : "确认细纲，进入正文创作 →"}
        </button>
        {rawResult && (
          <p className="text-center text-gray-500 text-xs">
            注：当前版本为大纲阶段，详细小节编辑将在正文创作界面中逐步完善
          </p>
        )}
      </div>
    </div>
  );
}
